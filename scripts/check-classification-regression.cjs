const fs = require('fs');
const path = require('path');
const vm = require('vm');

const importScript = path.resolve(__dirname, 'import-paper-notes.cjs');
const source = fs.readFileSync(importScript, 'utf8');
const mainStart = source.indexOf('if (!fs.existsSync(sourceRoot))');

if (mainStart === -1) {
  throw new Error('Unable to isolate classification helpers from import-paper-notes.cjs');
}

const sandbox = {
  console,
  require,
  process,
  __dirname,
  module: { exports: {} },
  exports: {},
};

vm.runInNewContext(
  `${source.slice(0, mainStart)}
module.exports = { classify, categoryNames, titleCaseFromId };
`,
  sandbox,
  { filename: importScript },
);

const { classify, categoryNames, titleCaseFromId } = sandbox.module.exports;

const cases = [
  {
    title: 'TagSplat: Topology-Aware Gaussian Splatting for Dynamic Mesh Modeling and Tracking',
    text: 'TagSplat proposes topology-aware Gaussian Splatting for dynamic mesh modeling, dynamic reconstruction, and 3D keypoint tracking.',
    dir: 'visual_tracking',
    expected: ['2-1-2'],
    forbiddenPrefix: '3-2',
  },
  {
    title: 'GSTAR: Gaussian Surface Tracking and Reconstruction',
    text: 'Gaussian surface tracking and reconstruction for dynamic 3D surfaces with Gaussian Splatting.',
    dir: 'visual_tracking',
    expected: ['2-1-2', '2-5'],
    forbiddenPrefix: '3-2',
  },
  {
    title: 'One-Stream Transformer Tracking with Joint Template-Search Modeling',
    text: 'A one-stream visual tracking transformer with joint template-search modeling for single object tracking.',
    dir: 'visual_tracking',
    expected: ['3-2-2'],
  },
  {
    title: 'Two-Stream Siamese Tracking with Asymmetric Feature Interaction',
    text: 'A two-stream Siamese tracking framework with template branch and search branch interaction.',
    dir: 'visual_tracking',
    expected: ['3-2-3'],
  },
  {
    title: 'Open-Vocabulary DETR for Object Detection',
    text: 'Open-vocabulary DETR for object detection with open set recognition.',
    dir: 'object_detection',
    expected: ['3-1-6'],
  },
  {
    title: 'Medical MLLM for Tumor Segmentation',
    text: 'A medical MLLM and medical VLM for tumor segmentation and clinical reasoning.',
    dir: 'medical_imaging',
    expected: ['10-7'],
  },
  {
    title: 'LoRA Adapter Tuning for Efficient Vision-Language Models',
    text: 'LoRA adapter tuning and parameter-efficient fine-tuning for vision-language models.',
    dir: 'model_compression',
    expected: ['11-13'],
  },
  {
    title: 'Model Compression via Module Replacement',
    text: 'Model compression through module replacement for efficient inference.',
    dir: 'model_compression',
    expected: ['11-12'],
  },
  {
    title: 'Generic 3D Generation with Diffusion Priors',
    text: 'A general 3D generation framework using diffusion priors.',
    dir: 'image_generation',
    expected: ['5-3-7'],
    forbidden: ['5-3-1'],
  },
  {
    title: 'Image-to-3D Asset Generation with Multi-view Diffusion',
    text: 'Image-to-3D asset generation with multi-view diffusion priors.',
    dir: 'image_generation',
    expected: ['5-3-2', '5-3-6'],
  },
];

let failed = 0;

for (const testCase of cases) {
  const raw = `${testCase.title} ${testCase.text} ${testCase.dir}`;
  const actual = classify(raw, testCase.dir, testCase.title);
  const ok =
    testCase.expected.includes(actual) &&
    !(testCase.forbidden || []).includes(actual) &&
    (!testCase.forbiddenPrefix || !actual.startsWith(testCase.forbiddenPrefix));

  if (!ok) {
    failed += 1;
    console.error(
      [
        `FAIL: ${testCase.title}`,
        `  expected: ${testCase.expected.map((id) => `${id} ${categoryNames[id] || ''}`).join(' OR ')}`,
        `  actual:   ${actual} ${categoryNames[actual] || ''}`,
        `  path:     ${titleCaseFromId(actual).join(' / ')}`,
      ].join('\n'),
    );
  }
}

if (failed > 0) {
  console.error(`\n${failed} classification regression test(s) failed.`);
  process.exit(1);
}

console.log(`Classification regression checks passed: ${cases.length}`);
