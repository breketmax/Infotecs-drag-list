window.addEventListener('load',()=>{
  fetchProducts(10,0);
});

let productsState = [];
const loadingBlock = document.querySelector("#loadingBlock");
const productList = document.querySelector(".product-list");
let prevCountProducts = 10;
let byPrice = 0;
let byRating =0;


function fetchProducts(limit,skip){
  fetch(`https://dummyjson.com/products?limit=${limit}&skip=${skip}`)
    .then(res => res.json())
    .then(res => {
      productsState = productsState.concat(res.products);
      showProducts(res.products);
    })
    .catch( err => {
      console.log(err);
    })
};


function showProducts(products){
  products.forEach(prodObj => {
    productList.innerHTML+= createProductItem(prodObj)
  });
  if(byPrice != 0){   // если какой то фильтр был активен, отрендерить новые продукты в соответсвии с ним
    byPrice *=-1;
    sortByPrice();
  }
  if(byRating !=0){
    byRating*=-1;
    sortByRating()
  }
  document.querySelector(".loading-indicator").classList.add("hide");
};

function dragStart(elem){
  elem.classList.add("drag");
  productList.classList.add("dragging")
};
function dragEnd(elem){
  elem.classList.remove("drag");
  productList.classList.remove("dragging")
};

function createProductItem(productObject){
  return `<div class="product-item" data-id="${productObject.id}" draggable="true" ondragstart="{dragStart(this)}" ondragend="{dragEnd(this)}" onmouseover="this.classList.add('active')" onmouseleave="this.classList.remove('active')">
  ${productObject.title}
  <sup class="rating">${productObject.rating}<img src="img/star.svg" width="16"></sup> 
  <p class="price">${productObject.price}$</p>
  <div class="product-description">
    <div class="description-content">
      <div class="cover-block">
        <img class="product-cover" src="${productObject.thumbnail}" alt="product-cover">
      </div>
      <div class="cover-images">
      ${placeCoverImages(productObject.images)}
      </div>
      <h1>${productObject.title}</h1>
      <p>${productObject.description}</p>
      <ul class="description-list">
        <li><span>brand</span>${productObject.brand}</li>
        <li><span>category</span>${productObject.category}</li>
        <li><span>stock</span>${productObject.stock}</li>
      </ul>
      <p class="card-price">${productObject.price}$</p>
    </div>
  </div>
</div>`
};

function placeCoverImages(images){
  let imgString =  ``;
  images.forEach(img => {
    imgString += `<img src="${img}" onmouseover="{changeCover(this)}" loading="lazy">`
  });
  return imgString;
}

function changeCover(ths){    //смена обложки по наведению на картинку продукта
  let activeCover = document.querySelector(".active .product-cover");
  activeCover.src = ths.src;
}

productList.addEventListener('dragover',(e)=>{   
  e.preventDefault();                 //необходимо для вставки элементов
  const dragElem = productList.querySelector(".drag");
  const underMouseElem = e.target; //элемент под мышкой
  const isMove = dragElem !== underMouseElem && underMouseElem.classList.contains("product-item"); //если это тот же самый элемент или вообще не элемент списка то ретурн
  if(!isMove){
    return
  };
  const nextElem = dragElem === underMouseElem.nextElementSibling ? underMouseElem:  underMouseElem.nextElementSibling;  //определяем след. элемент куда вставить
  productList.insertBefore(dragElem,nextElem);
});


function showMoreProducts(value){
  if(+value.value == +prevCountProducts)return;

  document.querySelector(".loading-indicator.hide").classList.remove("hide");


  if(+value.value> +prevCountProducts){         // если пользователь попросил больше продуктов то рендерим больше из запроса или из стейта
    if(+value.value > productsState.length){  //не делать лишний запрос на сервер так как в стейте уже есть нужные данные
      fetchProducts(value.value-prevCountProducts,prevCountProducts)
    }
    else{
      // loadingBlock.classList.remove("hide");
      // console.log( loadingBlock);
      showProducts(productsState.slice(prevCountProducts,value.value))
    }
    
  }
  else if(+value.value<+prevCountProducts){   // если пользователь попросил меньше продуктов то очищаем список для того чтоб продукты показались по порядку
    clearList();
    showProducts(productsState.slice(0,value.value));
  }
  prevCountProducts=value.value;
};


function clearList(){
  byPrice =0;
  byRating=0;
  let productItems = document.querySelectorAll(".product-item");
  productItems.forEach(prd => prd.remove());
}


function sortByPrice(){
  if(!byPrice) byPrice=1; 
  byRating =0;
  let activeProducts = productsState.slice(0,prevCountProducts);
  let productItems = document.querySelectorAll(".product-item");

  if(byPrice>0){
    sortByIncrease(activeProducts,"price");
  }else if(byPrice <0){
    sortByDecrease(activeProducts,"price");
  }
  byPrice *=-1;  //переключать сортровку от большего к меньшему и наоборот

  activeProducts.forEach( obj => { //берем id продукта который на странице и рендерим его в нужной последовательности в соответсвии с отсортированным массивом продуктов activeProducts
    let idx = 0;
    for(let i =0;i< productItems.length;++i){
      if(obj.id == productItems[i].dataset.id){
        idx=i;
        break;
      }
    }
    productList.appendChild(productItems[idx]);
  })
}

function sortByRating(){
  if(!byRating) byRating=1;
  byPrice = 0;
  let activeProducts = productsState.slice(0,prevCountProducts);
  let productItems = document.querySelectorAll(".product-item");

  if(byRating<0){
    sortByIncrease(activeProducts,"rating");
  }else if(byRating >0){
    sortByDecrease(activeProducts,"rating");
  }
  byRating *=-1;

  activeProducts.forEach( obj => {             //берем id продукта который на странице и рендерим его в нужной последовательности в соответсвии с отсортированным массивом продуктов activeProducts
    let idx = 0;
    for(let i =0;i< productItems.length;++i){
      if(obj.id == productItems[i].dataset.id){
        idx=i;
        break;
      }
    }
    productList.appendChild(productItems[idx]);
  })
}

function sortByIncrease(array,param){
  array.sort(function(a,b){
    if(a[param] > b[param]){
      return 1;
    }
    if(a[param] < b[param]){
      return -1;
    }
    return 0;
  })
}
function sortByDecrease(array,param){
  array.sort(function(a,b){
    if(a[param] < b[param]){
      return 1;
    }
    if(a[param] > b[param]){
      return -1;
    }
    return 0;
  })
}