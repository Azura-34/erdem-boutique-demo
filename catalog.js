let seedProductsPromise;
window.loadSeedProducts = () => {
  if (!seedProductsPromise) {
    seedProductsPromise = fetch('products-seed.json', {cache:'no-store'})
      .then(response => {
        if (!response.ok) throw new Error('Catalog seed could not be loaded.');
        return response.json();
      })
      .then(data => {
        if (!Array.isArray(data)) throw new Error('Catalog seed has an invalid format.');
        return data;
      });
  }
  return seedProductsPromise;
};
