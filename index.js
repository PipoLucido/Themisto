/*let miPrimeraPromise = new Promise((resolve, reject) => {
  
    setTimeout(function(){
      resolve("¡Éxito!"); // ¡Todo salió bien!
    }, 3350);

});

const arrow = async ( ) => {

   console.log( await miPrimeraPromise )
    
    console.log("hola2")

}

arrow()

await page.screenshot({path: 'example.png'});

*/

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport:null
  });
  let pageData ;
  const page = await browser.newPage();
  
  //tagOfElement/s
    let buscadorInput = ".header-userbar-input";
    let buscadorButton = ".header-userbar-icons2"


    //WebPage:
  await page.goto('https://www.easy.com.ar');

    //WhatToDo: Search all products by name on page and get all data of the products that
    //the search engine found, then save this data on the data base 

  //Write 'product' on input
  await page.type(buscadorInput,"silla");

  //Click on search icon
  await page.click(buscadorButton);

  
  //Load page
  await page.waitForNavigation();

  //get url from articles
  const urlArticles = await page.$$(".thumb-name");
  let url;
  let data;

  console.log("Cantidad de articulos: "+urlArticles.length)


  for (const urls of urlArticles) {

    //Nodo hijo de .thumb-name -> a
    const direccion = await urls.$('a')

    //Obtener propiedades href
    url = await direccion.getProperty('href')

    url = await url.jsonValue();

    //console.log(url)
    

    //Abrir url en nueva tab para extraer data
    pageData = await browser.newPage();
    await pageData.goto(url);

    //pageData focus
    await pageData.bringToFront();

    //Extraer data de pageData(nuevo tab):

    //<div>Titulo</div>
    const innerTitle = await pageData.evaluate(() => document.querySelector('.prod-title').innerText);
   

    //<span>precio</span>
    const innerPrice = await pageData.$('.price-e')

    let precio = await innerPrice.getProperty('innerText')

    precio = await precio.jsonValue();


    //<img/> array .fotorama__stage__shaft > [ .fotorama__img ]

    let urlImagenes=[];

    let arrayDeImagenes = await pageData.$('.fotorama__stage__shaft')

    arrayDeImagenes = await arrayDeImagenes.$$('.fotorama__img')

    for(const images of arrayDeImagenes){

      let prePush = await images.getProperty('src')

      prePush = await prePush.jsonValue();

      //console.log(prePush)

      urlImagenes.push(prePush)

    }


    //codigo de articulo <li>codigo de articulo</li>
    let idArticle = await pageData.$('.tabs-list')

    idArticle = await idArticle.$('li')

    idArticle = await idArticle.getProperty('innerText')

    idArticle = await idArticle.jsonValue();


    //SKU .product-description > size-10
    let SKU = await pageData.$('.product-description')

    SKU = await SKU.$$('.size-10')

    SKU = await SKU[1].getProperty('innerText')

    SKU = await SKU.jsonValue();
    

    console.log('{ Titulo: '+innerTitle+
    ', precio: '+precio+
    ', '+idArticle+
    ', Imagenes: '+urlImagenes+
    ', SKU: '+SKU+' }');

    //LimpiarVariables
    urlImagenes=[];

    //Close Tab pageData
    pageData.close()
  }
  


  
  //CloseBrowser
  await browser.close();
})();