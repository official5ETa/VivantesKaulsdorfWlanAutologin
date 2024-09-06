import fetch from 'node-fetch';
import puppeteer from 'puppeteer';
import { existsSync } from 'node:fs';

function log(type, ...args) {
  const date = new Date;
  console[type](
    `[${date.getDate()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}]`,
    ...args);
}

async function interval() {
  let browser;
  try {
    const response = await fetch('https://login.lan1.de/', { redirect: 'manual' });

    if (response.headers.get('location').endsWith('/login')) {
      browser = await puppeteer.launch({
        headless: true,
        ...(existsSync('/usr/bin/google-chrome-stable') ? { executablePath: '/usr/bin/google-chrome-stable' } : {})
      });
      const page = (await browser.pages())[0] || await browser.newPage();

      await page.goto(response.url);
      await (await page.waitForSelector('form[name=sendin] button[type=submit]', { timeout: 5e3 })).click();

      await page.waitForSelector('form[name=logout]', { timeout: 5e3 });
      log('info', 'logged into network');
    }
  } catch (error) { debugger }
  finally { await browser?.close() }

  setTimeout(() => interval().then(), 6e3);
}

interval().then();
log('log', 'started');