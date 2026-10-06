/*
 * 抖拾光 · 支持页脚本
 * 仅做三件事：hash 分区切换（只允许 privacy / contact）、按构建配置渲染联系入口、
 * 可选地读取运行时 manifest 版本。只通过 textContent 与 setAttribute 写入，
 * 不拼装动态标记、不执行返回内容，不发起网络请求，不写入存储，
 * 不自动写入剪贴板，不自动提交任何表单。
 */
(function () {
  'use strict';

  var TABS = ['privacy', 'contact'];
  var FIXED_SUBJECT = '抖拾光反馈';
  var EMAIL_RE = /^[A-Za-z0-9._+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;
  var ISSUES_RE = /^\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+\/issues(?:\/new)?\/?$/;

  function byId(id) {
    return document.getElementById(id);
  }

  function rawHash() {
    return String(window.location.hash || '').replace(/^#/, '');
  }

  function resolveTab(value) {
    return TABS.indexOf(value) === -1 ? 'privacy' : value;
  }

  /* ------------------------------------------------------------ 分区切换 */

  function activate(name) {
    var tab = resolveTab(name);
    TABS.forEach(function (key) {
      var panel = byId('panel-' + key);
      var button = byId('tab-' + key);
      var on = key === tab;
      if (panel) panel.hidden = !on;
      if (button) {
        button.classList.toggle('is-active', on);
        button.setAttribute('aria-selected', on ? 'true' : 'false');
        button.setAttribute('tabindex', on ? '0' : '-1');
      }
    });
  }

  function applyHash() {
    var raw = rawHash();
    var tab = resolveTab(raw);
    activate(tab);
    if (raw !== tab) {
      // 非法的 hash 一律归位到合法分区，且不新增历史记录。
      try {
        window.history.replaceState(null, '', '#' + tab);
      } catch (error) {
        /* 忽略：历史接口不可用时仅保持默认分区 */
      }
    }
  }

  /* ------------------------------------------------------------ 联系入口 */

  function readConfig() {
    var raw = {};
    try {
      raw = window.DMOSupportConfig || {};
    } catch (error) {
      raw = {};
    }
    return {
      email: typeof raw.email === 'string' ? raw.email.trim() : '',
      issuesUrl: typeof raw.issuesUrl === 'string' ? raw.issuesUrl.trim() : ''
    };
  }

  function safeEmail(value) {
    if (!value || value.length > 254) return '';
    return EMAIL_RE.test(value) ? value : '';
  }

  function safeIssuesUrl(value) {
    if (!value || !/^https:\/\/github\.com\//i.test(value)) return '';
    var url;
    try {
      url = new URL(value);
    } catch (error) {
      return '';
    }
    if (url.protocol !== 'https:') return '';
    if (url.hostname.toLowerCase() !== 'github.com') return '';
    if (url.username || url.password) return '';
    if (url.port) return '';
    if (url.search || url.hash) return '';
    if (!ISSUES_RE.test(url.pathname)) return '';
    return url.href;
  }

  function setHidden(id, hidden) {
    var element = byId(id);
    if (element) element.hidden = !!hidden;
  }

  function renderContact() {
    var config = readConfig();
    var email = safeEmail(config.email);
    var issues = safeIssuesUrl(config.issuesUrl);

    var emailLink = byId('contact-email');
    if (emailLink) {
      if (email) {
        emailLink.textContent = email;
        emailLink.setAttribute('href', 'mailto:' + email + '?subject=' + encodeURIComponent(FIXED_SUBJECT));
      } else {
        emailLink.textContent = '';
        emailLink.removeAttribute('href');
      }
    }
    setHidden('contact-email-item', !email);

    var issuesLink = byId('contact-issues');
    if (issuesLink) {
      if (issues) {
        issuesLink.textContent = issues;
        issuesLink.setAttribute('href', issues);
      } else {
        issuesLink.textContent = '';
        issuesLink.removeAttribute('href');
      }
    }
    setHidden('contact-issues-item', !issues);

    var status = byId('contact-status');
    if (status) {
      if (!email && !issues) {
        status.textContent = '未配置作者联系方式';
        status.classList.add('is-empty');
      } else {
        status.textContent = '选择以下方式联系作者';
        status.classList.remove('is-empty');
      }
    }
  }

  /* ------------------------------------------------------------ 版本信息 */

  function renderVersion() {
    var target = byId('app-version');
    if (!target) return;
    try {
      if (typeof chrome === 'undefined' || !chrome.runtime || typeof chrome.runtime.getManifest !== 'function') {
        return;
      }
      var manifest = chrome.runtime.getManifest();
      if (manifest && typeof manifest.version === 'string' && manifest.version) {
        target.textContent = 'v' + manifest.version;
        target.hidden = false;
      }
    } catch (error) {
      /* 忽略：非扩展环境或不支持 manifest 时静默跳过 */
    }
  }

  /* ------------------------------------------------------------ 初始化 */

  function init() {
    renderVersion();
    renderContact();
    applyHash();
    window.addEventListener('hashchange', applyHash);
    TABS.forEach(function (key) {
      var button = byId('tab-' + key);
      if (!button) return;
      button.addEventListener('keydown', function (event) {
        if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
        event.preventDefault();
        var next = event.key === 'Home' ? 'privacy' : event.key === 'End' ? 'contact' : key === 'privacy' ? 'contact' : 'privacy';
        window.location.hash = next; activate(next); byId('tab-' + next).focus();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
