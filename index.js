const puppeteer = require('puppeteer');
const axios = require('axios');
const {argv} = require('yargs')



async function puppet(arg){


  const browser = await puppeteer.launch({
    headless: true, //CAMBIAR A FALSE PARA VER NAVEGADOR
    defaultViewport:null
  });
  let pageData ;
  const page = await browser.newPage();
  
  //tagOfElement/s
    let buscadorInput = ".header-userbar-input";
    let buscadorButton = ".header-userbar-icons2"


    //WebPage:
  await page.goto('https://www.easy.com.ar/tienda/es/easyar');

    //WhatToDo: Search all products by name on page and get all data of the products that
    //the search engine found, then save this data on the data base 

  //Write 'product' on input
  await page.type(buscadorInput,arg);

  //Click on search icon
  await page.click(buscadorButton);

  
  //Load page
  await page.waitForNavigation();

  //get url from articles
  const urlArticles = await page.$$(".thumb-name");
  let url;
  let data = {
    job: arg,
    array:[]
  };

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


    // Configure the navigation timeout
    await pageData.setDefaultNavigationTimeout(0);

    //Navigate to webSite
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
    

   /* console.log('{ Titulo: '+innerTitle+
    ', precio: '+precio+
    ', '+idArticle+
    ', Imagenes: '+urlImagenes+
    ', SKU: '+SKU+' }');*/

    console.log('Wait.. Scrapping ..')

    data.array.push({
      title:innerTitle,
                price:parseInt(precio.split('.').join("")),
                id:parseInt(idArticle.match(/\d+/g).map(Number)),
                SKD:SKU,
                img: [urlImagenes]
    })
   

    //LimpiarVariables
    urlImagenes=[];

    //Close Tab pageData
    pageData.close()
  }
  
  console.log(data)
   //get 
    
    await axios.get('http://127.0.0.1:3000/jobs/save', {
      params: {
        datos: data
      }
    })
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    })
    .then(function () {
      // always executed
    });  
    


  
  //CloseBrowser
  await browser.close();
};


//:id es el argumento que es el articulo a buscar 
axios.get('http://127.0.0.1:3000/jobs/check/'+argv._[0])
.then(function (response) {
  // handle success
  //console.log(response);

  if(response.data == false){
    puppet(argv._[0])
  }
  

})
.catch(function (error) {
  // handle error
  console.log(error);
});
