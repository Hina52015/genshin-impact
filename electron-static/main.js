const { app, BrowserWindow, screen } = require('electron');
const express = require('express');
const path = require('path');

// 固定端口：保证每次启动都是同一个"网站"，
// 这样名单 / 设置 / 保底记录才会被浏览器保存下来。
const PREFERRED_PORT = 47821;

let server = null;
var win = null;

function buildServer() {
    const ex = express();
    ex.use(express.static(path.join(__dirname, 'static')));
    return ex;
}

function listen(preferredPort) {
    return new Promise((resolve, reject) => {
        const ex = buildServer();

        const attempt = (p, isFallback) => {
            const srv = ex.listen(p, 'localhost');
            srv.once('listening', () => resolve(srv));
            srv.once('error', () => {
                if (isFallback) {
                    reject(new Error('listen failed'));
                    return;
                }
                try { srv.close(); } catch (e) {}
                attempt(0, true);
            });
        };

        attempt(preferredPort, false);
    });
}

function computeSize() {
    let w = 900;
    let h = 1600;
    try {
        // workAreaSize 是"缩放后"的逻辑像素（对应 Windows 的缩放百分比）
        const wa = screen.getPrimaryDisplay().workAreaSize;

        let hh = Math.round(wa.height * 0.92);
        let ww = Math.round(hh * 9 / 16);

        if (ww > wa.width * 0.9) {
            ww = Math.round(wa.width * 0.9);
            hh = Math.round(ww * 16 / 9);
        }
        if (hh > wa.height) {
            hh = wa.height;
            ww = Math.round(hh * 9 / 16);
        }
        if (ww > wa.width) {
            ww = wa.width;
            hh = Math.round(ww * 16 / 9);
        }

        w = Math.max(1, Math.min(ww, wa.width));
        h = Math.max(1, Math.min(hh, wa.height));
    } catch (err) {}
    return { w, h };
}

function createWindow() {
    const size = computeSize();

    win = new BrowserWindow({
        width: size.w,
        height: size.h,
        minWidth: 240,
        minHeight: 360,
        center: true,
        frame: true,
        resizable: true,
        maximizable: true,
        fullscreenable: true,
        show: false,
        title: '原神抽卡点名器',
        backgroundColor: '#101014',
        autoHideMenuBar: true,
        webPreferences: {
            zoomFactor: 1,
            backgroundThrottling: false
        }
    });

    // 启动即最大化：保留标题栏与 — □ × 三个按钮（这不是全屏）
    win.once('ready-to-show', () => {
        try { win.maximize(); } catch (err) {}
        try { win.show(); } catch (err) {}
        try { win.focus(); } catch (err) {}
    });

    // 兜底：万一页面迟迟不就绪，也要把窗口显示出来
    setTimeout(() => {
        try {
            if (win && !win.isDestroyed() && !win.isVisible()) { try { win.maximize(); } catch (e) {} win.show(); }
        } catch (err) {}
    }, 4000);

    const port = server.address().port;
    win.loadURL('http://localhost:' + port);

    win.on('closed', () => {
        win = null;
    });
}

app.on('ready', () => {
    listen(PREFERRED_PORT)
        .then((srv) => {
            server = srv;
            createWindow();
        })
        .catch(() => {
            try {
                const ex = buildServer();
                server = ex.listen(0, 'localhost', () => createWindow());
            } catch (err) {}
        });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});

