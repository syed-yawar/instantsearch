describe('InstantSearch - Search on specific brand and query filtering', () => {
  beforeAll(() => {
    if (!browser.isMobile) {
      browser.maximizeWindow();
    }
  });

  it('navigates to the e-commerce demo', async () => {
    await browser.url('examples/e-commerce/');
  });

  it('selects "Apple" brand in list', async () => {
    const brand = await browser.$('.ais-RefinementList-labelText=Apple');
    await brand.click();
  });

  it('fills search input with "macbook"', async () => {
    const searchInput = await browser.$('[type=search]');
    await searchInput.setValue('macbook');
  });

  it('waits for the results list to be updated (wait for the "macbook" word to be highlighted)', async () => {
    await browser.waitUntil(
      async () => (await browser.$$('mark=MacBook')).length > 0,
      10000
    );
  });

  it('must match the expected results', async () => {
    const hits = await browser.$$('.hit h1');
    const hitsText = await Promise.all(hits.map(hit => hit.getText()));

    // Compare them to expected titles
    expect(hitsText).toEqual([
      'Apple - MacBook Air® (Latest Model) - 13.3" Display - Intel Core i5 - 8GB Memory - 128GB Flash Storage - Silver',
      'Apple - MacBook Air® (Latest Model) - 13.3" Display - Intel Core i5 - 8GB Memory - 256GB Flash Storage - Silver',
      'Apple - Macbook® (Latest Model) - 12" Display - Intel Core M3 - 8GB Memory - 256GB Flash Storage - Space Gray',
      'Apple - Macbook® (Latest Model) - 12" Display - Intel Core M3 - 8GB Memory - 256GB Flash Storage - Gold',
      'Apple - Macbook® (Latest Model) - 12" Display - Intel Core M3 - 8GB Memory - 256GB Flash Storage - Rose Gold',
      'Apple - Macbook® (Latest Model) - 12" Display - Intel Core M3 - 8GB Memory - 256GB Flash Storage - Silver',
      'Apple - Macbook® (Latest Model) - 12" Display - Intel Core M5 - 8GB Memory - 512GB Flash Storage - Space Gray',
      'Apple - Macbook® (Latest Model) - 12" Display - Intel Core M5 - 8GB Memory - 512GB Flash Storage - Rose Gold',
      'Apple - Macbook® (Latest Model) - 12" Display - Intel Core M5 - 8GB Memory - 512GB Flash Storage - Gold',
      'Apple - Macbook® (Latest Model) - 12" Display - Intel Core M5 - 8GB Memory - 512GB Flash Storage - Silver',
      'Apple - MacBook Pro with Retina display - 13.3" Display - 8GB Memory - 128GB Flash Storage - Silver',
      'Apple - MacBook Pro® - 13" Display - Intel Core i5 - 8 GB Memory - 256GB Flash Storage (latest model) - Space Gray',
      'Apple - MacBook® Pro - 15.4" Display - Intel Core i7 - 16GB Memory - 256GB Flash Storage - Silver',
      'Apple - MacBook Pro® - 13" Display - Intel Core i5 - 8 GB Memory - 256GB Flash Storage (latest model) - Silver',
      'Apple - MacBook® Pro - Intel Core i5 - 13.3" Display - 4GB Memory - 500GB Hard Drive - Silver',
      'Apple - MacBook Pro 13.3" Refurbished Laptop - Intel Core i5 - 4GB Memory - 320GB - Silver',
    ]);
  });
});