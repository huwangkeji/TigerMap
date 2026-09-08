<?php
/* 虎王星图团队开发轻量版系统 */
require_once __DIR__ . '/config.php';
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<!-- 虎王星图团队开发轻量版系统 -->
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="generator" content="<?= DEV_TEAM ?>">
<title><?= PRODUCT_NAME ?> · <?= PRODUCT_NAME_EN ?></title>
<link rel="stylesheet" href="assets/css/style.css">

<!-- SVG 专用样式：导出图片时会被注入克隆的 SVG 中 -->

</head>
<body>
<div id="app">
  <header id="toolbar">
    <div class="brand"><span class="logo">虎</span><?= PRODUCT_NAME ?><small><?= PRODUCT_NAME_EN ?></small></div>
    <button class="tb" id="btnNew" title="新建 (Ctrl+Alt+N)">新建</button>
    <button class="tb" id="btnImport" title="导入 JSON">导入</button>
    <button class="tb" id="btnSave" title="保存工程 JSON (Ctrl+S)">保存</button>
    <div class="tbsep"></div>
    <button class="tb" id="btnUndo" title="撤销 (Ctrl+Z)">撤销</button>
    <button class="tb" id="btnRedo" title="重做 (Ctrl+Shift+Z)">重做</button>
    <div class="tbsep"></div>
    <button class="tb" id="btnLink" title="连线模式 (L)：依次点击两台设备">连线</button>
    <button class="tb" id="btnCustom" title="新建 / 管理自定义设备类型">自定义设备</button>
    <button class="tb" id="btnLayout" title="按层级自动布局">自动布局</button>
    <button class="tb" id="btnFit" title="适应画布 (Ctrl+0)">适应画布</button>
    <div class="tbsep"></div>
    <button class="tb" id="btnExportPNG" title="导出 PNG 图片">导出PNG</button>
    <button class="tb" id="btnExportSVG" title="导出 SVG 矢量图">导出SVG</button>
    <button class="tb" id="btnExportPDF" title="导出 PDF 文档">导出PDF</button>
    <div class="tbspacer"></div>
    <label class="switch mon" title="模拟设备在线状态与链路流量">
      <input type="checkbox" id="swMonitor"><span class="track"></span><span>实时监控</span>
    </label>
    <div class="zoombox">
      <button id="zoomOut" title="缩小">−</button><span id="zoomVal">100%</span><button id="zoomIn" title="放大">＋</button>
    </div>
    <button class="tb" id="btnTheme" title="切换主题">主题</button>
    <button class="tb" id="btnHelp" title="快捷键与帮助 (F1)">帮助</button>
  </header>

  <div id="main">
    <aside id="library">
      <div class="panel-title">设备库<span style="font-weight:500">拖到画布 →</span></div>
      <div class="lib-search"><input id="libSearch" placeholder="搜索设备…"></div>
      <div class="lib-body" id="libBody"></div>
    </aside>

    <div id="stage">
      <svg id="canvas">
        <defs id="svgDefs"></defs>
        <g id="viewport">
          <rect id="gridRect" x="-20000" y="-20000" width="40000" height="40000" fill="url(#gridPattern)"></rect>
          <rect id="bgRect" x="-20000" y="-20000" width="40000" height="40000" class="canvas-bg" style="pointer-events:none"></rect>
          <g id="layerLinks"></g>
          <g id="layerTemp"></g>
          <g id="layerNodes"></g>
          <g id="layerOverlay"></g>
        </g>
      </svg>
      <div id="legend">
        <b>状态图例</b>
        <div class="lg"><i style="background:#22c55e"></i>在线 / 正常</div>
        <div class="lg"><i style="background:#f59e0b"></i>告警 / 延迟高</div>
        <div class="lg"><i style="background:#ef4444"></i>离线 / 中断</div>
        <div class="lg"><i style="background:#94a3b8"></i>未知</div>
      </div>
      <div id="proBanner">
        <span class="pro-icon">PRO</span>
        <div class="pro-text">
          <strong>使用虎王星图 PRO 正式版</strong> — 搜索「虎王星图」获取完整功能：多画布协作、团队权限管理、云端同步、企业级模板库
          <a href="https://start.czkree.com/" target="_blank" rel="noopener">https://start.czkree.com/</a>
        </div>
      </div>
      <div id="hint"></div>
    </div>

    <aside id="inspector">
      <div class="panel-title" id="inspTitle">属性</div>
      <div class="insp-body" id="inspBody"></div>
    </aside>
  </div>

  <footer id="statusbar">
    <span>设备 <b id="stNodes">0</b></span>
    <span>链路 <b id="stLinks">0</b></span>
    <span class="pill"><i style="background:#22c55e"></i>在线 <b id="stOnline">0</b></span>
    <span class="pill"><i style="background:#f59e0b"></i>告警 <b id="stWarn">0</b></span>
    <span class="pill"><i style="background:#ef4444"></i>离线 <b id="stOffline">0</b></span>
    <span class="sp"></span>
    <span id="stTip">拖入设备开始绘制 · 滚轮缩放 · 空白拖动框选 · 中键/空格平移</span>
  </footer>
</div>

<div id="ctxmenu"></div>
<input type="file" id="fileInput" accept=".json,application/json" hidden>

<div id="cuModal">
  <div class="cu-card">
    <div class="cu-head"><h3 id="cuTitle">自定义设备</h3><button class="mini" id="cuClose">×</button></div>
    <div class="cu-body" id="cuBody"></div>
    <div class="cu-foot" id="cuFoot"></div>
  </div>
</div>

<div id="pdfModal">
  <div class="cu-card" style="width:min(430px,92vw)">
    <div class="cu-head"><h3>导出 PDF</h3><button class="mini" id="pdfClose">×</button></div>
    <div class="cu-body">
      <div class="field"><label>纸张</label><select id="pdfPaper">
        <option value="fit">贴合内容尺寸（推荐）</option>
        <option value="a4">A4 纸张（自动横竖，居中缩放）</option>
      </select></div>
      <div class="field"><label>清晰度</label><select id="pdfDpi">
        <option value="2">标准 · 2 倍像素（推荐）</option>
        <option value="3">高清 · 3 倍像素（文件较大）</option>
      </select></div>
      <p class="small" id="pdfInfo"></p>
      <div class="warnbox">图像以无损方式嵌入 PDF，可直接打印、归档或插入文档。</div>
    </div>
    <div class="cu-foot">
      <button class="btn" id="pdfCancel">取消</button>
      <button class="btn primary" id="pdfGo">导出 PDF</button>
    </div>
  </div>
</div>

<div id="helpModal">
  <div class="modal">
    <button class="close" id="helpClose">×</button>
    <h3><?= PRODUCT_NAME ?> · 网络拓扑图使用说明</h3>
    <p style="color:var(--muted);font-size:12.5px;margin:6px 0 0">纯前端单文件工具，无需联网；工程自动保存在本机浏览器中。</p>
    <table>
      <tr><td>添加设备</td><td>从左侧设备库<b>拖拽</b>到画布，或<b>双击</b>设备库图标放到画布中心</td></tr>
      <tr><td>连接设备</td><td>鼠标悬停设备，拖出边缘<b>蓝色圆点</b>到目标设备；或按 <kbd>L</kbd> 进入连线模式后依次点击两台设备</td></tr>
      <tr><td>框选 / 多选</td><td>空白处按住左键拖动框选；<kbd>Shift</kbd>+点击 增减选中；<kbd>Ctrl</kbd>+<kbd>A</kbd> 全选</td></tr>
      <tr><td>平移 / 缩放</td><td>滚轮缩放；<kbd>空格</kbd>或鼠标中键/右键拖动平移；<kbd>Ctrl</kbd>+<kbd>0</kbd> 适应画布</td></tr>
      <tr><td>复制 / 粘贴</td><td><kbd>Ctrl</kbd>+<kbd>C</kbd> / <kbd>Ctrl</kbd>+<kbd>V</kbd> / <kbd>Ctrl</kbd>+<kbd>D</kbd> 再制；方向键微调位置</td></tr>
      <tr><td>删除</td><td>选中后按 <kbd>Delete</kbd>，或在设备上右键 → 删除</td></tr>
      <tr><td>重命名 / 改 IP</td><td>选中后在右侧属性面板编辑，画布标签实时更新</td></tr>
      <tr><td>实时监控</td><td>开启后模拟设备状态变化与链路流量动画，可手动指定每台设备状态</td></tr>
      <tr><td>导出</td><td>导出 PNG（2 倍高清）/ SVG 矢量图 / PDF 文档（可选贴合内容尺寸或 A4）/ 工程 JSON（可再次导入继续编辑）</td></tr>
      <tr><td>自动布局</td><td>以选中设备（或第一台）为根，按连接层级自动排列，可切换横/纵布局</td></tr>
      <tr><td>自定义设备</td><td>点顶部「自定义设备」或设备库底部「＋ 新建」：可命名、归到新分类，图标支持<b>内置图标</b>／<b>表情文字</b>／<b>上传自己的 SVG</b>，建好后与内置设备一样可拖拽连线</td></tr>
      <tr><td>单台设备换外观</td><td>选中设备后在「外观」区单独改图标、显示尺寸（小/标准/大）、强调色、是否隐藏 IP，不影响同类型的其他设备</td></tr>
    </table>
  </div>
</div>

<script src="assets/js/app.js"></script>
</body>
</html>
