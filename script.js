BASE_PATH = "data/img/";
SUBMIT_URL = "data";
TASK_DATA_PATH = "data/infographics.json";

DEBUG = false;
IM_ID = null;
IM_DATA = null;
TAG = null;
N_SECONDS = null;
SUBJ = null;
IDX = null;

// urls of the form BASE_URL?im_id=0&n_s=1&subj_id=0

$(document).ready(function() {
    DEBUG = gup("debug") == "true";
    TAG = gup("tag");

    //var data_path = gup("data");
    //if (data_path.length == 0) data_path = "sample";
    var im_id = gup('im_id') ? gup('im_id') : '0';
    var n_seconds = parseInt(gup('n_s'));
    N_SECONDS = n_seconds;
    SUBJ = gup("subj_id");
    $.ajax({
        url: TASK_DATA_PATH,
        dataType: 'json',
        type: 'GET',
        success: function(data) {
            console.log(data);
            // assume we just have a list of videos 
            var im_data = data[im_id];
            IM_ID = im_id;
            IM_DATA = im_data;
            console.log('im_data', im_data);
            preload_im(im_data.url);
            addChecks(im_data);
            showData(im_data, n_seconds);
        }
    });
});  

function preload_im(img_url) {
  var img = new Image();
  img.src = BASE_PATH + img_url;
  img.onload = (function() {
    console.log("loaded");
    $('#show-image').removeClass('loading');
  });  
}

function addChecks(im_data) {
  var categories = im_data.categories;
  shuffleArray(categories);
  categories.forEach(function(cat) {
    //var safeLabel = getSafeVersion(cat);
    var cat_id = cat[0];
    var cat_name = cat[1];
    var checkbox = '<div class="field"><label>' + cat_name + ':</label><input type="text" placeholder="0" name="' + cat_id + '"></div>'
    $(".form").find(".grouped.fields").append(checkbox);
  });
}

function getSafeVersion(label) {
  return label.replace(" ", "_").toLowerCase();
}

function showData(im_data, n_seconds) {
  // put the image in the box 
  var im_path = im_data.url;
  $('#infographic-img').attr('src', BASE_PATH + im_path);

  // click button to show image 
  $("#show-image").click(showImage.bind(this, im_data, n_seconds));
}

function showImage(im_data, n_seconds) {
  $('#instructions').hide();
  $('#infographic-img-container').show();
  setTimeout(hideImage.bind(this, im_data), n_seconds*1000)
}

function hideImage(im_data) {
  $('#infographic-img-container').hide();
  $('#categories-container').show();
  $('#submit-button').click(onClickSubmit);
}

function onClickSubmit() {
  $('#submit-button').addClass("loading");

  var data = collectData();
  console.log("data", data);
  if (!DEBUG) {
    $.ajax({
        url: SUBMIT_URL,
        type: 'POST',
        data: JSON.stringify(data),
        dataType: 'json'
    }).then(function(response) {
        console.log("success!");
        $('#categories-container').hide();
        $('#success').show();
    }).catch(function(error) {
        console.log("error!");
        $('#categories-container').hide();
        $('#data-submitted').text(JSON.stringify(data));
        $('#failure').show();
    });
  }
}

function collectData() {
  answers = {}
  $('.field').each(function(i, elt) {
    var cat_id = $(elt).find('input').attr("name");
    var val = $(elt).find('input').val();
    answers[cat_id] = val;
  })
  return {
    'im_id': IM_ID,
    'im_data': IM_DATA,
    'answers': answers,
    'n_seconds': N_SECONDS,
    'subj_id': SUBJ,
    'tag': TAG
  }
}

function gup(name) {
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var tmpURL = window.location.href;
    var results = regex.exec( tmpURL );
    if (results == null) return "";
    else return results[1];
}
  
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}