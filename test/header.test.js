const puppeteer = require('puppeteer');

let browser, page;


beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false
  });
  page = await browser.newPage();
  await page.goto('localhost:3000');
});

afterEach(async () => {
  // await browser.close();
});

test('header有文字', async () => {
  const text = await page.$eval('a.brand-logo', el => el.innerHTML);
  expect(text).toEqual('Blogster');
});

test('登录oauth流程', async () => {
  await page.click('.right a');
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test.only('登陆后显示退出', async () => {
  const id = '5b4e9f2a7b60c2782168d4b3';
  const Buffer = require('safe-buffer').Buffer;
  const sessionObj = {"passport":{"user":id}};
  const sessionString = Buffer.from(JSON.stringify(sessionObj))
      .toString('base64');

  const Keygrip = require('keygrip');
  const keys = require('../config/keys');
  const keygrip = new Keygrip([keys.cookieKey]);

  const sig = keygrip.sign('session=' + sessionString);

  console.log(sessionString, sig);
  console.log(keys.cookieKey);
  await page.setCookie({name: 'session', value: sessionString});
  await page.setCookie({name: 'session.sig', value: sig});
  await page.goto('localhost:3000');
  await page.waitFor('a[href="/auth/logout"]');

  const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);
  expect(text).toEqual('Logout');
});
