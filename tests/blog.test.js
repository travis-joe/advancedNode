const Page = require('./helpers/page');
let page

beforeEach(async () => {
  page = await Page.build()
  await page.goto('localhost:3000')
})

afterEach(async ()=>{
  await page.close();
})



describe('登录后', async () => {
  beforeEach(async ()=> {
    await page.login();
    await page.click('a.btn-floating');
  })

  test('出现create表单', async () => {
    const label = await page.getContentsOf('form label');
    expect(label).toEqual('Blog Title');
  });

  describe('合法输入', async () => {
    beforeEach(async () => {
      await page.type('.title input', 'My Title');
      await page.type('.content input','My Content');
      await page.click('form button');
    })

    test('跳转review页面', async () => {
      const text = await page.getContentsOf('h5');
      expect(text).toEqual('Please confirm your entries');
    });

    test('提交保存blog', async () => {
      await page.click('button.green');
      await page.waitFor('.card');

      const title = await page.getContentsOf('.card-title');
      const content = await page.getContentsOf('p');

      expect(title).toEqual('My Title');
      expect(content).toEqual('My Content');
    });
  });

  describe('不合法输入', async ()=> {
    beforeEach(async () => {
      await page.click('form button');
    });
    test('显示错误', async () => {
      const titleError = await page.getContentsOf('.title .red-text');
      const contentError = await page.getContentsOf('.content .red-text');

      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    })
  })
})