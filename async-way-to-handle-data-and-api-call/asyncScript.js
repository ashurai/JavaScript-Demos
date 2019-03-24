function strCleaner(str){
  return str.replace(/[^\w\s]|_/g,'')
          .replace(/\s+/g, ' ')
          .toLowerCase();
}

function makeSubStr(str, regexp){
  return strCleaner(str).match(regexp) || [];
}

function getWords(str){
  return makeSubStr(str, /\b[a-z\d]+\b/g)
}

function mapWords(str){
  return getWords(str).reduce(function(map, word){
    map[word] = (map[word] || 0) + 1;
    return map;
  }, {});
}

function mapEachWord(map){
  return Object.keys(map).map(function(key){
    return [key, map[key]];
  })
}

function sortedMap(map, sortByFn, sortOrder){
  return mapEachWord(map).sort(function(first, second){
    return sortByFn.call(undefined, first, second, sortOrder);
  })
}

function wordOccurrance(str){
  return sortedMap(mapWords(str), function(first, second, order){
    if (second[1] > first[1]){
      return order[1] * -1;
    } else if (first[1] > second[1]){
      return order[1] * 1;
    } else {
      return order[0] * (first[0] < second[0] ? - 1 : (first[0] > second[0] ? 1 : 0));
    }
  }, [1, -1]);
}


// Used jquery only to print data on front
var formatedData = [];
function formatStructure(title, counter, apiResponse){
  formatedData.push(
    {'word': title,
     output: {
       'count': counter,
       'synonyms': (apiResponse[0]) ? apiResponse[0].tr : [],
       'pos': (apiResponse[0]) ? apiResponse[0].pos : ''
      }
    }
  );
}

// Added static way to merge params , replace with some predefined functions to generate url with params
function fetchRecordFromApi(word, wordCounter){
  var apiKey = "dict.1.1.20170610T055246Z.0f11bdc42e7b693a.eefbde961e10106a4efa7d852287caa49ecc68cf";
  var wordParam = "&text="+word;
  var url = 'https://dictionary.yandex.net/api/v1/dicservice.json/lookup?lang=en-en&key='+apiKey+wordParam;
  return fetch(url)
  .then(
    function(response) {
      if (response.status !== 200){
        console.log('Looks like there was a problem. Status Code: ' +
        response.status);
      return;
      }
      // Deal with the api response and generate required format
      response.json().then(function(apiRes){
        return formatStructure(word, wordCounter, apiRes.def)
      })
    }
  )
  .catch(function(err) {
    console.log('Fetch Error :-S', err);
  });
}


// Start fetching all the text from file
fetch('big.txt')
.then(
  function(response) {
    if (response.status !== 200) {
      console.log('Looks like there was a problem. Status Code: ' +
        response.status);
      return;
    }

    // Deal with the text from response
    response.text().then(function(data) {
      var wordOccurred = wordOccurrance(data)
      wordOccurred.slice(0,10).forEach(function(value){
        fetchRecordFromApi(value[0], value[1])
      })
      console.log(formatedData)
      return formatedData;      
    });
  }
)
.catch(function(err) {
  console.log('Fetch Error :-S', err);
});


