// global variables
var _products = [];

function $(selector){
  var selectorFlag = selector[0];
  var selectorId = selector.slice(1)

  if (selectorFlag == ".") {
    return document.getElementsByClassName(selectorId);
  }

  return document.getElementById(selectorId); 
}

// helper functions
function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
  function(m,key,value) {
    vars[key] = value;
  });
  return vars;
}

function updateUrl(param_name, value) {
  var query = '';
  var params = getUrlVars();
  params[param_name] = value;
  
  for(var key in params) {
    query += key+'='+params[key]+'&';
  }

  return location.href.split("?")[0]  + '?' + query;
}

function loadJSON(path, success, error) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        if (success)
          success(JSON.parse(xhr.responseText));
      } else {
        if (error)
          error(xhr);
      }
    }
  };
  xhr.open('GET', path, true);
  xhr.send();
}

// controller functions 

function clickProduct(event) {
    // update URI
    var id = event.target.getAttribute('data-product-id');
    if (id === null) return;
    history.pushState('', 'Teespring: Product ' + id, updateUrl('id', id));

    // update product image & title
    // update & send url change to browser pushState
    
    // add selected class to clicked thumbnail
    // location.href = updateUrl('id', id);
    
    // move selected thumbnail to 70px from left (whole list)

    console.log('click ' + id);

    selectProduct();
    event.preventDefault();
}

// UI functions 
function selectProduct() {
  var selectedId = getUrlVars()['id'] ? getUrlVars()['id'] : "1";
  var products = document.getElementsByClassName('product');
  for (var i = 0; i<products.length; i++) {
    products[i].classList.remove('selected');

    if (products[i].firstChild.getAttribute('data-product-id') == selectedId) {
      products[i].className += ' selected';


      var productsOffset = $('#products').style.left ? parseInt($('#products').style.left) : 0;
      var offset = 70 - getOffsetRect(products[i]).left + productsOffset;
      $('#products').style.left = offset + "px"; 
      console.log(offset);

    }
  }

  for (var i in _products) {
    if (_products[i].id == selectedId) {
      $('#product-image-image').src = _products[i].product_image_url;
      $('#product-title').innerHTML = _products[i].id + ". " + _products[i].title;
      break;
    }
  }
}

function renderSelectorProduct(product) {
  return "<li class='product'>" + 
    "<a data-product-id='" + product.id + "' class='thumbnail' href='#'></a>" +
    "<span>" + product.id + "</span></li>";
}

function renderView(data) {
  var productsEl = document.getElementById('products');
  productsEl.addEventListener('click', clickProduct);
  for (i in _products) {
    productsEl.innerHTML += renderSelectorProduct(_products[i]);
  }
  selectProduct();
}

function getOffsetRect(elem) {
  // (1)
  var box = elem.getBoundingClientRect();
  
  var body = document.body;
  var docElem = document.documentElement;
  
  // (2)
  var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
  var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
  
  // (3)
  var clientTop = docElem.clientTop || body.clientTop || 0;
  var clientLeft = docElem.clientLeft || body.clientLeft || 0;
  
  // (4)
  var top  = box.top +  scrollTop - clientTop;
  var left = box.left + scrollLeft - clientLeft;
  
  return { top: Math.round(top), left: Math.round(left) }
}

// main app 

// wait for DOM content to load
document.addEventListener('DOMContentLoaded', function(event) {

  // var productsElement = document.getElementById('products');
  // console.log(getOffsetRect(productsElement));

  loadJSON(
    'products.json',
    function(data) { _products = data; renderView(); },
    function(xhr)  { console.error(xhr); }
  );
});

window.onpopstate = selectProduct;

