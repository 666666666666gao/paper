const fs = require('fs');
const path = require('path');

const sourceRoot = process.argv[2] || path.join(process.env.TEMP || '', 'paper-notes-source', 'docs');
const outputFile = path.resolve(__dirname, '..', 'src', 'data', 'papers.ts');
const outputJsonFile = path.resolve(__dirname, '..', 'public', 'data', 'papers.json');
const sourceBaseUrl = 'https://github.com/zhaoyang97/Paper-Notes/blob/main/docs/';
const knownConferences = ['NEURIPS', 'SIGGRAPH', 'CVPR', 'ICCV', 'ECCV', 'ICLR', 'ICML', 'AAAI', 'ACL', 'EMNLP', 'NAACL', 'KDD', 'WWW', 'MM', '3DV'];

const categoryNames = {
  '1': 'Foundation Models 基础模型与架构',
  '1-1': 'LLM 大语言模型',
  '1-2': 'MLLM 多模态大语言模型',
  '1-3': 'Vision-Language 视觉和语言',
  '1-4': 'CLIP',
  '1-5': 'Vision Transformer',
  '1-6': 'Mamba / SSM',
  '1-7': 'DETR',
  '1-8': 'Diffusion Models 扩散模型',
  '1-9': 'GAN',
  '2': '3D Vision 3D视觉',
  '2-1-1': 'Static 3DGS 静态 3DGS',
  '2-1-2': 'Dynamic 3DGS 动态 3DGS',
  '2-1-3': 'Gaussian SLAM',
  '2-1-4': 'Gaussian Avatar',
  '2-1-5': 'Gaussian Editing',
  '2-1-6': 'Gaussian Generation',
  '2-1-7': 'Gaussian Compression',
  '2-1-8': 'Gaussian Relighting',
  '2-2-1': 'Fully-supervised 3DVG 全监督 3DVG',
  '2-2-2': 'Weakly-supervised 3DVG 弱监督 3DVG',
  '2-2-3': 'Semi-supervised 3DVG 半监督 3DVG',
  '2-2-4': 'Zero-shot 3DVG 零样本 3DVG',
  '2-2-5': 'Open-vocabulary 3DVG 开放词汇 3DVG',
  '2-2-6': 'LLM/VLM-based 3DVG',
  '2-2-7': 'Embodied 3DVG 具身 3DVG',
  '2-2-8': 'Object-level 3DVG',
  '2-2-9': 'Region-level 3DVG',
  '2-2-10': 'Mask-level 3DVG',
  '2-3': 'NeRF',
  '2-4': 'Novel View Synthesis 新视点合成',
  '2-5': '3D Reconstruction 三维重建',
  '2-6': '3D Generation 3D生成',
  '2-7': '3D Point Cloud 3D点云',
  '2-8': '3D Object Detection 3D目标检测',
  '2-9': '3D Semantic Segmentation 3D语义分割',
  '2-10': '3D Instance Segmentation 3D实例分割',
  '2-11': '3D Object Tracking 3D目标跟踪',
  '2-12': '3D Semantic Scene Completion 3D语义场景补全',
  '2-13': '3D Registration 3D配准',
  '2-14': 'Depth Estimation 深度估计',
  '2-15': 'Stereo Matching 立体匹配',
  '2-16': '3D Human Pose Estimation 3D人体姿态估计',
  '2-17': '3D Human Mesh Estimation 3D人体 Mesh 估计',
  '3-1-1': 'One-stage Detection 一阶段检测',
  '3-1-2': 'Two-stage Detection 二阶段检测',
  '3-1-3': 'Anchor-based Detection',
  '3-1-4': 'Anchor-free Detection',
  '3-1-5': 'DETR-based Detection',
  '3-1-6': 'Open-vocabulary Detection 开放词汇检测',
  '3-1-7': 'Weakly-supervised Detection 弱监督检测',
  '3-1-8': 'Semi-supervised Detection 半监督检测',
  '3-1-9': 'Few-shot Detection 小样本检测',
  '3-1-10': 'Long-tail Detection 长尾检测',
  '3-1-11': 'Tiny Object Detection 小目标检测',
  '3-1-12': 'Real-time Detection 实时检测',
  '3-2-1': 'Single Object Tracking 单目标跟踪',
  '3-2-2': 'One-stream Tracking',
  '3-2-3': 'Two-stream Tracking',
  '3-2-4': 'Siamese Tracking',
  '3-2-5': 'Transformer Tracking',
  '3-2-6': 'Long-term Tracking 长时跟踪',
  '3-2-7': 'Multi Object Tracking 多目标跟踪',
  '3-2-8': 'Tracking-by-Detection',
  '3-2-9': 'Joint Detection and Tracking',
  '3-2-10': 'Graph-based MOT',
  '3-2-11': 'Transformer MOT',
  '3-2-12': 'Referring Tracking 语言引导跟踪',
  '3-2-13': 'RGB-T Tracking',
  '3-2-14': 'RGB-D Tracking',
  '3-2-15': 'UAV Tracking',
  '3-2-16': 'Event-based Tracking',
  '3-2-17': 'Point Tracking 点跟踪',
  '4-1-1': 'Fully-supervised Semantic Segmentation',
  '4-1-2': 'Weakly-supervised Semantic Segmentation',
  '4-1-3': 'Semi-supervised Semantic Segmentation',
  '4-1-4': 'Open-vocabulary Semantic Segmentation',
  '4-1-5': 'Domain-adaptive Semantic Segmentation',
  '4-2': 'Instance Segmentation 实例分割',
  '4-3': 'Panoptic Segmentation 全景分割',
  '4-4-1': 'Fully-supervised RIS',
  '4-4-2': 'Weakly-supervised RIS',
  '4-4-3': 'Zero-shot RIS',
  '4-4-4': 'MLLM-based RIS',
  '4-5-1': 'Semi-supervised VOS',
  '4-5-2': 'Unsupervised VOS',
  '4-5-3': 'Interactive VOS',
  '4-5-4': 'Referring VOS',
  '4-6': 'Video Instance Segmentation 视频实例分割',
  '4-7': 'Medical Image Segmentation 医学图像分割',
  '4-8': 'Image Matting 图像抠图',
  '5-1-1': 'Text-to-Image',
  '5-1-2': 'Image-to-Image',
  '5-1-3': 'Personalized Generation',
  '5-1-4': 'Subject-driven Generation',
  '5-1-5': 'Controllable Generation',
  '5-2-1': 'Text-to-Video',
  '5-2-2': 'Image-to-Video',
  '5-2-3': 'Long Video Generation',
  '5-2-4': 'Human Video Generation',
  '5-3-1': 'Text-to-3D',
  '5-3-2': 'Image-to-3D',
  '5-3-3': 'Single-view 3D Generation',
  '5-3-4': 'Multi-view 3D Generation',
  '5-3-5': 'Mesh Generation',
  '5-3-6': 'Gaussian Generation',
  '5-4-1': 'Text-guided Image Editing',
  '5-4-2': 'Instruction-based Editing',
  '5-4-3': 'Mask-guided Editing',
  '5-4-4': 'Image Inpainting',
  '5-4-5': 'Object Removal',
  '5-5-1': 'Human Avatar',
  '5-5-2': 'Talking Head',
  '5-5-3': 'Gaussian Avatar',
  '5-5-4': 'Animatable Avatar',
  '5-6': 'Style Transfer 风格迁移',
  '6-1-1': 'Single Image Super-Resolution',
  '6-1-2': 'Video Super-Resolution',
  '6-1-3': 'Blind Super-Resolution',
  '6-1-4': 'Real-world Super-Resolution',
  '6-1-5': 'Diffusion Super-Resolution',
  '6-2': 'Denoising 去噪',
  '6-3': 'Deblurring 去模糊',
  '6-4': 'Low-light Image Enhancement 暗光图像增强',
  '6-5': 'Image Quality Assessment 图像质量评价',
  '6-6': 'Video Quality Assessment 视频质量评价',
  '6-7': 'Image Compression 图像压缩',
  '6-8': 'Video Compression 视频压缩',
  '6-9': 'Compressive Sensing 压缩感知',
  '6-10': 'Image Representation / 2D Gaussian Splatting',
  '6-11': 'Image Fusion 图像融合',
  '7-1': 'Video Understanding',
  '7-2': 'Action Detection 行为检测',
  '7-3': 'Temporal Action Localization 时序动作定位',
  '7-4': 'Video Prediction 视频预测',
  '7-5': 'Video MLLM',
  '7-6': 'Video Retrieval 视频检索',
  '8-1': 'Lane Detection 车道线检测',
  '8-2': 'Occupancy Prediction 占用预测',
  '8-3': 'Trajectory Prediction 轨迹预测',
  '8-4': 'Motion Forecasting 运动预测',
  '8-5': 'End-to-end Driving 端到端驾驶',
  '8-6': '3D Detection for Autonomous Driving',
  '8-7': 'Semantic Scene Completion',
  '8-8': 'HD Map / Online Mapping 高精地图与在线建图',
  '9-1': 'Agent',
  '9-2': 'Embodied AI 具身智能',
  '9-3': 'Vision-Language Navigation 视觉语言导航',
  '9-4': 'Object Navigation',
  '9-5': 'Robotic Manipulation 机器人操作',
  '9-6': 'Spatial Intelligence 空间智能',
  '9-7': 'World Model 世界模型',
  '9-8': 'LLM Agent',
  '9-9': 'MLLM Agent',
  '9-10': 'Memory Agent',
  '9-11': 'Tool-use Agent',
  '9-12': 'Aerial / UAV Navigation 空中导航',
  '10-1': 'Medical Image 医学图像',
  '10-2': 'Medical Image Segmentation 医学图像分割',
  '10-3': 'Medical Detection 医学检测',
  '10-4': 'Medical Classification 医学分类',
  '10-5': 'Medical Registration 医学配准',
  '10-6': 'Medical Reconstruction 医学重建',
  '10-7': 'Medical MLLM 医学多模态大模型',
  '10-8': 'Remote Sensing 遥感',
  '10-9': 'Oriented Object Detection 旋转目标检测',
  '11-1': 'Self-supervised Learning 自监督学习',
  '11-2': 'Semi-supervised Learning 半监督学习',
  '11-3': 'Weakly-supervised Learning 弱监督学习',
  '11-4': 'Zero-shot Learning 零样本学习',
  '11-5': 'Few-shot Learning 小样本学习',
  '11-6': 'Long-tail Learning 长尾分布',
  '11-7': 'Knowledge Distillation 知识蒸馏',
  '11-8': 'Model Pruning 模型剪枝',
  '11-9': 'Quantization 量化',
  '11-10': 'NAS 神经架构搜索',
  '11-11': 'Data Augmentation 数据增强',
  '12-1': 'OCR',
  '12-2': 'Text Detection 文本检测',
  '12-3': 'GNN',
  '12-4': 'Scene Graph Generation 场景图生成',
  '12-5': 'Image Retrieval 图像检索',
  '12-6': 'Feature Matching 特征匹配',
  '12-7': 'Image Captioning 图像描述',
  '12-8': 'Visual Question Answering 视觉问答',
  '12-9': 'Sign Language Recognition 手语识别',
  '12-10': 'Datasets 数据集',
  '12-11': 'New Tasks 新任务',
  '12-12': 'Others 其他',
  '12-13': 'Computer Graphics / Differentiable Rendering',
};

Object.assign(categoryNames, {
  '2-1': '3D Gaussian Splatting / 3DGS',
  '2-2': '3D Visual Grounding / 3DVG / 3D视觉定位',
  '3': 'Detection & Tracking 检测与跟踪',
  '3-1': 'Object Detection 目标检测',
  '3-2': 'Visual Tracking 目标跟踪',
  '4': 'Segmentation 分割',
  '4-1': 'Semantic Segmentation 语义分割',
  '4-4': 'Referring Image Segmentation 参考图像分割',
  '4-5': 'Video Object Segmentation 视频目标分割',
  '5': 'Generation & Editing 生成与编辑',
  '5-1': 'Image Generation 图像生成',
  '5-2': 'Video Generation 视频生成',
  '5-3': '3D Generation 3D生成',
  '5-4': 'Image Editing 图像编辑',
  '5-5': 'Avatars',
  '6': 'Low-level Vision',
  '6-1': 'Super-Resolution 超分辨率',
  '7': 'Video Understanding 视频理解',
  '8': 'Autonomous Driving 自动驾驶',
  '9': 'Embodied AI & Agent 具身智能与 Agent',
  '10': 'Medical & Remote Sensing 医学与遥感',
  '11': 'Learning & Efficiency 学习范式与效率',
  '12': 'Others 其他',
});

const pathNames = {
  '1': ['Foundation Models 基础模型与架构'],
  '2': ['3D Vision 3D视觉'],
  '3': ['Detection & Tracking 检测与跟踪'],
  '4': ['Segmentation 分割'],
  '5': ['Generation & Editing 生成与编辑'],
  '6': ['Low-level Vision'],
  '7': ['Video Understanding 视频理解'],
  '8': ['Autonomous Driving 自动驾驶'],
  '9': ['Embodied AI & Agent 具身智能与 Agent'],
  '10': ['Medical & Remote Sensing 医学与遥感'],
  '11': ['Learning & Efficiency 学习范式与效率'],
  '12': ['Others 其他'],
};

function titleCaseFromId(id) {
  const parts = id.split('-');
  const names = pathNames[parts[0]] ? [...pathNames[parts[0]]] : [];
  let cursor = '';
  for (const part of parts) {
    cursor = cursor ? `${cursor}-${part}` : part;
    if (cursor !== parts[0] && categoryNames[cursor]) names.push(categoryNames[cursor]);
  }
  return names.length ? names : [categoryNames[id] || 'Others 其他'];
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath, out);
    if (entry.isFile() && entry.name.endsWith('.md') && !['index.md', 'TODO.md', 'README.md'].includes(entry.name)) out.push(fullPath);
  }
  return out;
}

function pickLine(text, label) {
  const pattern = new RegExp(`^\\\\*\\\\*${label}\\\\*\\\\*:\\\\s*(.+?)\\\\s*$`, 'im');
  return cleanInline((text.match(pattern) || [])[1] || '');
}

function cleanInline(value) {
  return String(value || '')
    .replace(/\s{2,}$/gm, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .trim();
}

function frontmatterValue(text, key) {
  const match = text.match(new RegExp(`^${key}:\\\\s*>-\\\\s*\\\\n([\\\\s\\\\S]*?)(?=^\\\\w+:|^---)`, 'm'));
  if (match) return cleanInline(match[1].split('\n').map((line) => line.replace(/^\s+/, '')).join(' '));
  const single = text.match(new RegExp(`^${key}:\\\\s*(.+)$`, 'm'));
  return cleanInline((single || [])[1] || '');
}

function frontmatterTags(text) {
  const match = text.match(/^tags:\s*\n([\s\S]*?)(?=^---)/m);
  if (!match) return [];
  return match[1]
    .split('\n')
    .map((line) => cleanInline(line.replace(/^\s*-\s*/, '')))
    .filter(Boolean);
}

function firstMarkdownUrl(value) {
  const markdown = value.match(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/);
  if (markdown) return markdown[1];
  const raw = value.match(/https?:\/\/[^\s)]+/);
  return raw ? raw[0] : undefined;
}

function normalizeArxiv(url) {
  if (!url) return undefined;
  return url.replace('/pdf/', '/abs/').replace(/\.pdf$/, '');
}

function codeInfo(text) {
  const codeLine = (text.match(/^\*\*代码\*\*:\s*(.+)$/m) || [])[1] || '';
  const line = cleanInline(codeLine);
  const url = firstMarkdownUrl(line) || firstMarkdownUrl(text.match(/github\.com\/[^\s)]+/i)?.[0] || '');
  if (url) return { codeUrl: url };

  const note = line.replace(/^\[?有\]?$/, '').trim();
  if (!note || /^(暂无|无|待确认|暂未开源|暂未发布|none|no)$/i.test(note)) {
    return { codeNote: note || '无' };
  }
  const rawUrl = note.match(/https?:\/\/\S+/)?.[0];
  if (rawUrl) return { codeUrl: rawUrl };
  return { codeNote: note };
}

function includesAny(text, words) {
  return words.some((word) => text.includes(word));
}

function matchesAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function classify(raw, dir) {
  const text = raw.toLowerCase();
  const isRemote = dir === 'remote_sensing' || includesAny(text, ['remote sensing', '遥感', 'sar image', 'satellite image']);
  const isMedical = dir === 'medical_imaging' || includesAny(text, ['medical', '医学', 'mri', 'ct ', 'x-ray', 'ultrasound', 'brain decoding', 'fmri', 'eeg']);
  const isVisionGeneration = includesAny(text, ['diffusion', 'text-to-image', 'text to image', 'image generation', 'video generation', 'image editing', 'text-guided diffusion', '图像生成', '视频生成', '图像编辑']);
  const isNlpSimilarity = matchesAny(text, [
    /\bsentence embedding(s)?\b/,
    /\btext embedding(s)?\b/,
    /\btextual embedding(s)?\b/,
    /\bsimilarity metric(s)?\b/,
    /\bsemantic understanding\b/,
    /\bisotrop(y|ic)\b/,
    /\bintrinsic dimensionality\b/,
    /\bprompt-based text\b/,
    /\bmteb\b/,
    /\bnlp\b/,
  ]);
  const hasStrong3D = includesAny(text, [
    '3d ', '3d-', '3d_', 'point cloud', 'point-cloud', '点云', 'nerf', 'novel view',
    'view synthesis', 'depth estimation', 'stereo matching', 'lidar', 'monocular 3d', 'mesh', 'scene completion',
    'occupancy', 'slam', 'gaussian splatting', '3dgs', '3d gaussian', '三维',
  ]);

  if (isRemote) {
    if (includesAny(text, ['oriented object', 'rotated object', '旋转目标'])) return '10-9';
    return '10-8';
  }

  if (isMedical) {
    if (includesAny(text, ['segmentation', '分割'])) return '10-2';
    if (includesAny(text, ['detection', '检测'])) return '10-3';
    if (includesAny(text, ['classification', '分类'])) return '10-4';
    if (includesAny(text, ['registration', '配准'])) return '10-5';
    if (includesAny(text, ['reconstruction', '重建', 'synthesis', '合成', 'super-resolution', '超分辨'])) return '10-6';
    if (includesAny(text, ['mllm', 'multimodal', 'vlm'])) return '10-7';
    return '10-1';
  }

  if (includesAny(text, ['video super-resolution', 'video super resolution', 'video sr', '视频超分', '视频超分辨率'])) return '6-1-2';
  if (includesAny(text, ['super-resolution', 'super resolution', 'image super-resolution', 'image super resolution', '超分辨率', '超分'])) {
    if (includesAny(text, ['blind'])) return '6-1-3';
    if (includesAny(text, ['real-world', 'real world', '真实世界'])) return '6-1-4';
    if (includesAny(text, ['diffusion'])) return '6-1-5';
    return '6-1-1';
  }

  if (isNlpSimilarity && !isVisionGeneration) {
    if (includesAny(text, ['similarity', 'metric', 'embedding', 'isotropy', 'intrinsic dimensionality', 'mteb'])) return '12-12';
  }

  if (includesAny(text, ['ai-generated text', 'machine-generated text', 'llm-generated', 'textual creativity', 'text distribution', '文本检测', '机器文本检测'])) return '12-12';

  if (includesAny(text, ['model compression', '模型压缩', 'lora merging', 'lora合并', 'module replacement', '模型合并', 'parameter-efficient fine-tuning', '低秩适配'])) return '11-7';

  if (includesAny(text, ['vector graphics', '矢量图形', 'bézier', 'bezier', 'bitmap primitives'])) return '12-13';
  if (includesAny(text, ['2d gaussian splatting', '2d gaussian', 'image representation', '图像表示'])) return '6-10';
  if (includesAny(text, ['infrared-visible image fusion', 'image fusion', '图像融合', '红外', '可见光'])) return '6-11';

  if (dir === 'autonomous_driving' || includesAny(text, ['hd map', 'online mapping', '在线建图', '高精地图', 'lane detection', 'occupancy prediction', 'trajectory prediction', 'motion forecasting', 'end-to-end driving'])) {
    if (includesAny(text, ['lane detection'])) return '8-1';
    if (includesAny(text, ['occupancy'])) return '8-2';
    if (includesAny(text, ['trajectory'])) return '8-3';
    if (includesAny(text, ['motion forecasting'])) return '8-4';
    if (includesAny(text, ['3d detection'])) return '8-6';
    if (includesAny(text, ['scene completion'])) return '8-7';
    if (includesAny(text, ['hd map', 'online mapping', '在线建图', '高精地图'])) return '8-8';
    return '8-5';
  }

  if (includesAny(text, ['aerial vision-language navigation', 'uav navigation', '空中vln', '空中导航'])) return '9-12';
  if (includesAny(text, ['vision-language navigation', 'visual prompt navigation', 'object navigation', '视觉语言导航', '视觉导航'])) return '9-3';

  if (!hasStrong3D && includesAny(text, ['reasoning segmentation', '推理分割', 'referring image segmentation', 'language-visual segmentation', '语言-视觉分割'])) {
    if (includesAny(text, ['mllm', 'multi-modal', 'multimodal', '思维链'])) return '4-4-4';
    return '4-4-1';
  }

  if (!hasStrong3D && includesAny(text, ['semantic segmentation', 'image segmentation', 'dichotomous image segmentation', '语义分割', '图像分割', '二分图像分割'])) {
    if (includesAny(text, ['weakly'])) return '4-1-2';
    if (includesAny(text, ['semi-supervised'])) return '4-1-3';
    if (includesAny(text, ['open-vocabulary'])) return '4-1-4';
    if (includesAny(text, ['domain generalization', 'domain adaptation', '领域泛化', 'domain-adaptive'])) return '4-1-5';
    return '4-1-1';
  }

  if (matchesAny(text, [/\bpoint tracking\b/, /\bpoint tracking\b/, /\bpoint tracker\b/, /点跟踪/, /点追踪/])) return '3-2-17';

  if (includesAny(text, ['image restoration', '图像恢复', 'weather restoration', '恶劣天气', 'zero-shot image restoration'])) return '6-1-1';

  if (includesAny(text, ['face reconstruction', '人脸重建'])) return '5-1-2';
  if (includesAny(text, ['video diffusion', '视频扩散', 'video generation', '视频生成'])) return '5-2-1';
  if (!includesAny(text, ['semantic segmentation', '语义分割', '图像分割']) && includesAny(text, ['text-to-image', 'text to image', '文本到图像', 'image editing', '图像编辑', 'diffusion-based image editing'])) return '5-4-1';
  if (includesAny(text, ['safe text embedding guidance', 'unsafe content', 'sexual content generation', '安全生成'])) return '5-1-5';
  if (includesAny(text, ['text-guided diffusion', 'text-to-image diffusion', 'diffusion models', 'diffusion model', '扩散模型'])) return '5-1-1';

  if (includesAny(text, ['gaussian splatting', '3dgs', '3d gaussian', 'gaussian-splatting'])) {
    if (includesAny(text, ['slam', 'simultaneous localization'])) return '2-1-3';
    if (includesAny(text, ['avatar', 'human gaussian', 'head avatar', 'animatable'])) return '2-1-4';
    if (includesAny(text, ['edit', 'editing', 'editor', 'inpaint', 'remove'])) return '2-1-5';
    if (includesAny(text, ['generation', 'generate', 'text-to-3d', 'image-to-3d', '4d generation'])) return '2-1-6';
    if (includesAny(text, ['compress', 'compression', 'compact'])) return '2-1-7';
    if (includesAny(text, ['relight', 'relighting', 'lighting'])) return '2-1-8';
    if (includesAny(text, ['dynamic', '4d', 'deformable', 'motion', 'tracking'])) return '2-1-2';
    return '2-1-1';
  }

  if (includesAny(text, ['3d visual grounding', '3dvg', '3d grounding', 'grounded 3d', '3d referring', 'referit3d', 'nr3d', 'sr3d'])) {
    if (includesAny(text, ['weakly', 'weakly-supervised', '弱监督'])) return '2-2-2';
    if (includesAny(text, ['semi-supervised', '半监督'])) return '2-2-3';
    if (includesAny(text, ['zero-shot', '零样本'])) return '2-2-4';
    if (includesAny(text, ['open-vocabulary', 'open vocabulary', '开放词汇'])) return '2-2-5';
    if (includesAny(text, ['llm', 'vlm', 'large language', 'vision-language'])) return '2-2-6';
    if (includesAny(text, ['embodied', 'navigation', 'robot'])) return '2-2-7';
    if (includesAny(text, ['region'])) return '2-2-9';
    if (includesAny(text, ['mask'])) return '2-2-10';
    return includesAny(text, ['object']) ? '2-2-8' : '2-2-1';
  }

  if (hasStrong3D) {
    if (includesAny(text, ['nerf', 'neural radiance'])) return '2-3';
    if (includesAny(text, ['novel view', 'view synthesis', '新视角', '新视点'])) return '2-4';
    if (includesAny(text, ['reconstruction', '重建'])) return '2-5';
    if (includesAny(text, ['generation', 'text-to-3d', 'image-to-3d', '4d generation', '生成'])) return '2-6';
    if (includesAny(text, ['point cloud', 'point-cloud', '点云'])) return '2-7';
    if (includesAny(text, ['3d object detection', '3d detection', '目标检测'])) return '2-8';
    if (includesAny(text, ['semantic segmentation', '语义分割'])) return '2-9';
    if (includesAny(text, ['instance segmentation', '实例分割'])) return '2-10';
    if (includesAny(text, ['tracking', '目标跟踪'])) return '2-11';
    if (includesAny(text, ['scene completion', 'occupancy'])) return '2-12';
    if (includesAny(text, ['registration', '配准'])) return '2-13';
    if (includesAny(text, ['depth estimation', 'monocular depth', '深度估计'])) return '2-14';
    if (includesAny(text, ['stereo matching', '立体匹配'])) return '2-15';
    if (includesAny(text, ['human pose', '人体姿态'])) return '2-16';
    if (includesAny(text, ['human mesh', 'mesh recovery', 'smpl'])) return '2-17';
    return '2-7';
  }

  if (dir === 'object_detection' || matchesAny(text, [
    /\bobject detection\b/,
    /\bvisual detection\b/,
    /\bopen-vocabulary detection\b/,
    /\bweakly-supervised detection\b/,
    /\bsemi-supervised detection\b/,
    /\bfew-shot detection\b/,
    /\btiny object detection\b/,
    /目标检测/,
  ])) {
    if (includesAny(text, ['detr'])) return '3-1-5';
    if (includesAny(text, ['open-vocabulary', 'open vocabulary'])) return '3-1-6';
    if (includesAny(text, ['weakly'])) return '3-1-7';
    if (includesAny(text, ['semi-supervised'])) return '3-1-8';
    if (includesAny(text, ['few-shot'])) return '3-1-9';
    if (includesAny(text, ['long-tail', 'long tail'])) return '3-1-10';
    if (includesAny(text, ['tiny', 'small object'])) return '3-1-11';
    if (includesAny(text, ['real-time', 'realtime'])) return '3-1-12';
    if (includesAny(text, ['anchor-free'])) return '3-1-4';
    if (includesAny(text, ['anchor'])) return '3-1-3';
    if (includesAny(text, ['two-stage', 'faster r-cnn'])) return '3-1-2';
    return '3-1-1';
  }

  if (matchesAny(text, [
    /\bvisual tracking\b/,
    /\bobject tracking\b/,
    /\bmulti object tracking\b/,
    /\bmulti-object tracking\b/,
    /\bsingle object tracking\b/,
    /\bsot\b/,
    /\bmot\b/,
    /\btracking-by-detection\b/,
    /\bjoint detection and tracking\b/,
    /\blong-term tracking\b/,
    /\brgb-t tracking\b/,
    /\brgb-d tracking\b/,
    /\buav tracking\b/,
    /\bevent-based tracking\b/,
  ])) {
    if (includesAny(text, ['multi object', 'multi-object', 'mot'])) return '3-2-7';
    if (includesAny(text, ['tracking-by-detection'])) return '3-2-8';
    if (includesAny(text, ['joint detection'])) return '3-2-9';
    if (includesAny(text, ['graph'])) return '3-2-10';
    if (includesAny(text, ['transformer'])) return '3-2-11';
    if (includesAny(text, ['referring', 'language-guided'])) return '3-2-12';
    if (includesAny(text, ['rgb-t', 'rgbt'])) return '3-2-13';
    if (includesAny(text, ['rgb-d', 'rgbd'])) return '3-2-14';
    if (includesAny(text, ['uav'])) return '3-2-15';
    if (includesAny(text, ['event-based', 'event camera'])) return '3-2-16';
    if (includesAny(text, ['siamese'])) return '3-2-4';
    if (includesAny(text, ['transformer'])) return '3-2-5';
    if (includesAny(text, ['long-term'])) return '3-2-6';
    return '3-2-1';
  }

  if (dir === 'segmentation' || includesAny(text, ['segmentation', '分割', 'matting'])) {
    if (includesAny(text, ['medical'])) return '4-7';
    if (includesAny(text, ['matting'])) return '4-8';
    if (includesAny(text, ['video instance'])) return '4-6';
    if (includesAny(text, ['video object', 'vos'])) {
      if (includesAny(text, ['unsupervised'])) return '4-5-2';
      if (includesAny(text, ['interactive'])) return '4-5-3';
      if (includesAny(text, ['referring'])) return '4-5-4';
      return '4-5-1';
    }
    if (includesAny(text, ['referring image', 'ris'])) {
      if (includesAny(text, ['weakly'])) return '4-4-2';
      if (includesAny(text, ['zero-shot'])) return '4-4-3';
      if (includesAny(text, ['mllm', 'multimodal'])) return '4-4-4';
      return '4-4-1';
    }
    if (includesAny(text, ['panoptic'])) return '4-3';
    if (includesAny(text, ['instance'])) return '4-2';
    if (includesAny(text, ['weakly'])) return '4-1-2';
    if (includesAny(text, ['semi-supervised'])) return '4-1-3';
    if (includesAny(text, ['open-vocabulary'])) return '4-1-4';
    if (includesAny(text, ['domain adaptation', 'domain-adaptive'])) return '4-1-5';
    return '4-1-1';
  }

  if (dir === 'image_generation' || dir === 'video_generation' || includesAny(text, ['generation', 'editing', 'inpainting', 'avatar', 'talking head', 'style transfer'])) {
    if (includesAny(text, ['video generation', 'text-to-video'])) {
      if (includesAny(text, ['image-to-video'])) return '5-2-2';
      if (includesAny(text, ['long video'])) return '5-2-3';
      if (includesAny(text, ['human'])) return '5-2-4';
      return '5-2-1';
    }
    if (includesAny(text, ['text-to-3d', 'image-to-3d', 'single-view 3d', 'multi-view 3d', 'mesh generation'])) {
      if (includesAny(text, ['image-to-3d'])) return '5-3-2';
      if (includesAny(text, ['single-view'])) return '5-3-3';
      if (includesAny(text, ['multi-view'])) return '5-3-4';
      if (includesAny(text, ['mesh'])) return '5-3-5';
      return '5-3-1';
    }
    if (includesAny(text, ['avatar', 'talking head'])) {
      if (includesAny(text, ['talking head'])) return '5-5-2';
      if (includesAny(text, ['gaussian'])) return '5-5-3';
      if (includesAny(text, ['animatable'])) return '5-5-4';
      return '5-5-1';
    }
    if (includesAny(text, ['style transfer'])) return '5-6';
    if (includesAny(text, ['editing', 'edit', 'inpainting', 'object removal'])) {
      if (includesAny(text, ['instruction'])) return '5-4-2';
      if (includesAny(text, ['mask'])) return '5-4-3';
      if (includesAny(text, ['inpainting'])) return '5-4-4';
      if (includesAny(text, ['removal'])) return '5-4-5';
      return '5-4-1';
    }
    if (includesAny(text, ['image-to-image'])) return '5-1-2';
    if (includesAny(text, ['personalized'])) return '5-1-3';
    if (includesAny(text, ['subject-driven', 'subject driven'])) return '5-1-4';
    if (includesAny(text, ['controllable', 'controlnet'])) return '5-1-5';
    return '5-1-1';
  }

  if (dir === 'image_restoration' || includesAny(text, ['super-resolution', 'denoising', 'deblurring', 'low-light', 'quality assessment', 'compression'])) {
    if (includesAny(text, ['super-resolution', 'super resolution', '超分辨率'])) {
      if (includesAny(text, ['video'])) return '6-1-2';
      if (includesAny(text, ['blind'])) return '6-1-3';
      if (includesAny(text, ['real-world'])) return '6-1-4';
      if (includesAny(text, ['diffusion'])) return '6-1-5';
      return '6-1-1';
    }
    if (includesAny(text, ['denoising'])) return '6-2';
    if (includesAny(text, ['deblurring'])) return '6-3';
    if (includesAny(text, ['low-light'])) return '6-4';
    if (includesAny(text, ['video quality'])) return '6-6';
    if (includesAny(text, ['quality assessment'])) return '6-5';
    if (includesAny(text, ['video compression'])) return '6-8';
    if (includesAny(text, ['compression'])) return '6-7';
    return '6-9';
  }

  if (dir === 'video_understanding' || includesAny(text, ['video understanding', 'action detection', 'temporal action', 'video retrieval', 'video mllm'])) {
    if (includesAny(text, ['action detection'])) return '7-2';
    if (includesAny(text, ['temporal action'])) return '7-3';
    if (includesAny(text, ['prediction'])) return '7-4';
    if (includesAny(text, ['mllm', 'multimodal'])) return '7-5';
    if (includesAny(text, ['retrieval'])) return '7-6';
    return '7-1';
  }

  if (dir === 'autonomous_driving' || includesAny(text, ['autonomous driving', 'lane detection', 'occupancy', 'trajectory prediction', 'motion forecasting'])) {
    if (includesAny(text, ['lane'])) return '8-1';
    if (includesAny(text, ['occupancy'])) return '8-2';
    if (includesAny(text, ['trajectory'])) return '8-3';
    if (includesAny(text, ['motion forecasting'])) return '8-4';
    if (includesAny(text, ['end-to-end'])) return '8-5';
    if (includesAny(text, ['3d detection'])) return '8-6';
    if (includesAny(text, ['scene completion'])) return '8-7';
    if (includesAny(text, ['hd map', 'online mapping', '在线建图', '高精地图'])) return '8-8';
    return '8-5';
  }

  if (dir === 'robotics' || dir === 'llm_agent' || includesAny(text, ['embodied', 'agent', 'robot', 'navigation', 'world model', 'tool-use'])) {
    if (includesAny(text, ['embodied'])) return '9-2';
    if (includesAny(text, ['vision-language navigation'])) return '9-3';
    if (includesAny(text, ['object navigation'])) return '9-4';
    if (includesAny(text, ['manipulation'])) return '9-5';
    if (includesAny(text, ['spatial'])) return '9-6';
    if (includesAny(text, ['world model'])) return '9-7';
    if (includesAny(text, ['mllm agent'])) return '9-9';
    if (includesAny(text, ['memory'])) return '9-10';
    if (includesAny(text, ['tool-use', 'tool use'])) return '9-11';
    return includesAny(text, ['llm']) ? '9-8' : '9-1';
  }

  if (dir === 'medical_imaging' || dir === 'remote_sensing' || includesAny(text, ['medical', 'remote sensing', '遥感'])) {
    if (dir === 'remote_sensing' || includesAny(text, ['remote sensing'])) return includesAny(text, ['oriented object']) ? '10-9' : '10-8';
    if (includesAny(text, ['segmentation'])) return '10-2';
    if (includesAny(text, ['detection'])) return '10-3';
    if (includesAny(text, ['classification'])) return '10-4';
    if (includesAny(text, ['registration'])) return '10-5';
    if (includesAny(text, ['reconstruction'])) return '10-6';
    if (includesAny(text, ['mllm', 'multimodal'])) return '10-7';
    return '10-1';
  }

  if (['model_compression', 'self_supervised', 'llm_efficiency', 'optimization'].includes(dir) || includesAny(text, ['self-supervised', 'semi-supervised', 'weakly-supervised', 'zero-shot', 'few-shot', 'long-tail', 'distillation', 'pruning', 'quantization', 'nas', 'augmentation'])) {
    if (includesAny(text, ['self-supervised'])) return '11-1';
    if (includesAny(text, ['semi-supervised'])) return '11-2';
    if (includesAny(text, ['weakly-supervised'])) return '11-3';
    if (includesAny(text, ['zero-shot'])) return '11-4';
    if (includesAny(text, ['few-shot'])) return '11-5';
    if (includesAny(text, ['long-tail'])) return '11-6';
    if (includesAny(text, ['distillation'])) return '11-7';
    if (includesAny(text, ['pruning'])) return '11-8';
    if (includesAny(text, ['quantization'])) return '11-9';
    if (includesAny(text, ['nas', 'architecture search'])) return '11-10';
    return '11-11';
  }

  if (dir === 'multimodal_vlm' || includesAny(text, ['multimodal', 'mllm', 'vision-language', 'clip', 'llm', 'large language model', 'diffusion', 'mamba', 'vision transformer', 'detr'])) {
    if (includesAny(text, ['mllm', 'multimodal large'])) return '1-2';
    if (includesAny(text, ['vision-language', 'vlm'])) return '1-3';
    if (includesAny(text, ['clip'])) return '1-4';
    if (includesAny(text, ['vision transformer', 'vit'])) return '1-5';
    if (includesAny(text, ['mamba', 'ssm', 'state space'])) return '1-6';
    if (includesAny(text, ['detr'])) return '1-7';
    if (includesAny(text, ['diffusion'])) return '1-8';
    if (includesAny(text, ['gan'])) return '1-9';
    return '1-1';
  }

  if (dir === 'graph_learning' || includesAny(text, ['gnn', 'graph neural'])) return '12-3';
  if (dir === 'information_retrieval' || includesAny(text, ['image retrieval'])) return '12-5';
  if (includesAny(text, ['ocr'])) return '12-1';
  if (includesAny(text, ['text detection'])) return '12-2';
  if (includesAny(text, ['scene graph'])) return '12-4';
  if (includesAny(text, ['feature matching'])) return '12-6';
  if (includesAny(text, ['image captioning'])) return '12-7';
  if (includesAny(text, ['visual question answering', 'vqa'])) return '12-8';
  if (includesAny(text, ['sign language'])) return '12-9';
  if (includesAny(text, ['dataset', 'benchmark'])) return '12-10';
  if (includesAny(text, ['new task'])) return '12-11';
  return '12-12';
}

function makeId(rel, index) {
  const base = rel
    .toLowerCase()
    .replace(/\.md$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 96);
  return `${base}-${index}`;
}

function compactSummary(value, fallback) {
  const text = cleanInline(value || fallback || '')
    .replace(/^\[论文解读\]\s*/, '')
    .replace(/^\[[^\]]+\]\[[^\]]+\]\s*/, '');
  return text.length > 260 ? `${text.slice(0, 257)}...` : text;
}

if (!fs.existsSync(sourceRoot)) {
  throw new Error(`Source docs directory not found: ${sourceRoot}`);
}

const files = walk(sourceRoot).sort();
const papers = files.map((file, index) => {
  const text = fs.readFileSync(file, 'utf8');
  const rel = path.relative(sourceRoot, file).split(path.sep).join('/');
  const parts = rel.split('/');
  const conferencePath = parts[0] || '';
  const dir = parts[1] || '';
  const title =
    cleanInline((text.match(/^#\s+(.+)$/m) || [])[1]) ||
    frontmatterValue(text, 'title').replace(/^\[论文解读\]\s*/, '') ||
    path.basename(file, '.md').replace(/_/g, ' ');
  const confLine = pickLine(text, '会议');
  const conferenceText = `${confLine} ${conferencePath}`.toUpperCase();
  const conferenceMatch = knownConferences.find((conf) => conferenceText.includes(conf));
  const yearMatch = (confLine || conferencePath).match(/20\d{2}/);
  const conference = conferenceMatch || conferencePath.replace(/\d+$/, '') || 'Unknown';
  const year = yearMatch ? Number(yearMatch[0]) : 0;
  const tags = Array.from(
    new Set([
      ...frontmatterTags(text),
      ...pickLine(text, '关键词').split(/[,，、/]/).map(cleanInline),
      conference && year ? `${conference} ${year}` : conference,
    ].filter(Boolean)),
  ).slice(0, 8);
  const field = pickLine(text, '领域');
  const arxivLine = pickLine(text, 'arXiv');
  const paperUrl = normalizeArxiv(firstMarkdownUrl(arxivLine) || firstMarkdownUrl(text.match(/https?:\/\/arxiv\.org\/(?:abs|pdf)\/[^\s)]+/i)?.[0] || ''));
  const code = codeInfo(text);
  const searchable = `${title} ${field} ${tags.join(' ')} ${frontmatterValue(text, 'description')} ${dir}`;
  const categoryId = classify(searchable, dir);
  const category = categoryNames[categoryId] || 'Others 其他';
  const pathValue = titleCaseFromId(categoryId).join(' / ');

  return {
    id: makeId(rel, index),
    title,
    conference,
    year,
    category,
    categoryId,
    path: pathValue,
    tags,
    summary: compactSummary(frontmatterValue(text, 'description'), text.match(/## 一句话总结\s*\n([\s\S]*?)(?=\n##|\n#|$)/)?.[1]),
    paperUrl,
    ...code,
    noteUrl: `${sourceBaseUrl}${rel.split('/').map(encodeURIComponent).join('/')}`,
    sourcePath: rel,
  };
});

const publicPapers = papers.map(({ noteUrl, sourcePath, ...paper }) => paper);
const output = `import type { Paper } from '../types';\n\n// Paper records are generated into public/data/papers.json for fast static loading.\nexport const papers: Paper[] = [];\n`;
fs.writeFileSync(outputFile, output);
fs.mkdirSync(path.dirname(outputJsonFile), { recursive: true });
fs.writeFileSync(outputJsonFile, JSON.stringify(publicPapers));

const counts = papers.reduce((acc, paper) => {
  const top = paper.categoryId.split('-')[0];
  acc[top] = (acc[top] || 0) + 1;
  return acc;
}, {});

console.log(`Imported ${papers.length} papers into ${outputFile}`);
console.log(counts);
