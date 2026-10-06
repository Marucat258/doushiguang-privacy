/*
 * 抖拾光 · 支持页构建配置（build config）
 *
 * 这是唯一允许填写作者联系方式的地方，现已配置公开反馈邮箱，issuesUrl 仍留空。
 * 支持页只会根据这里的合法取值生成真实入口；留空或非法时只显示状态，
 * 绝不伪造邮箱、表单、服务器或任何“发送按钮”。
 *
 *   email     : 反馈邮箱，例如 "you@example.com"。
 *               仅当是合法邮箱时，才生成 mailto:<你的邮箱>?subject=抖拾光反馈。
 *               除收件人与固定主题外，不附带任何其他用户数据。
 *   issuesUrl : GitHub Issues 地址，例如 "https://github.com/<owner>/<repo>/issues"
 *               或 "https://github.com/<owner>/<repo>/issues/new"。
 *               仅接受 https://github.com/<owner>/<repo>/issues[/new]，
 *               不允许查询串、凭据、端口或其它主机。
 *
 * 本文件必须是本地静态脚本，不发起网络请求、不读取 Cookie、不写入存储。
 * 通过 globalThis 挂载，既可在浏览器（globalThis 即 window）中读取，
 * 也能在无 window 的纯脚本环境中安全执行。
 */
globalThis.DMOSupportConfig = {
  email: 'doushiguang_report@163.com',
  issuesUrl: ''
};
