const files = ['./one.txt', './two.txt', './three.txt', './bobsburgers.xml', './archer.xml', './supernatural.xml'];
const cacheName = 'cache-xml-v1';
let myCache;

caches
  .open(cacheName)
  .then((cache) => {
    myCache = cache;
    return myCache.addAll(files);
  })
  .then(() => {
    //all the files are in the cache
    //read all the file names and just get the txt ones
    return myCache.matchAll();
  })
  .then((responses) => {
    //read the responses
    // console.log(responses.length);
    let txtResponses = responses.filter((response) => {
      let url = new URL(response.url);
      if (url.pathname.endsWith('.txt')) {
        return true;
      }
    });
    //txtResponses is an array of response objects that are txt files
    return Promise.all(
      txtResponses.map((response) => {
        return response.text();
      })
    );
  })
  .then((strings) => {
    //find all the xml files from the strings in the txt files
    return Promise.all(strings.map((str) => myCache.match(str)));
    //cache.match is like fetch(url)
    //except one is from the cache and one is from the network
  })
  .then((xmlResponses) => {
    //read the xml responses
    return Promise.all(
      xmlResponses.map((response) => {
        //create a section element for each xml file
        let url = new URL(response.url);
        let nm = url.pathname.split('/').pop().replace('.xml', '').replace('/', '');
        document.body.innerHTML += `<section class="${nm}"><h1>${nm}</h1><ul></ul></section>`;
        return response.text();
        //extract the STRING contents from each XML file
      })
    );
  })
  .then((xmlStrings) => {
    //turn all the xml strings into xml documents
    let doms = xmlStrings.map((str) => {
      const parser = new DOMParser();
      return parser.parseFromString(str, 'application/xml'); // 'text/html'
      //synchronous NOT asynchronous
    });
    doms.forEach((dom, index) => {
      let section = dom.getElementsByTagName('section')[0].getAttribute('name');
      console.log(`section.${section} h1`);
      document.querySelector(`section.${section} h1`).textContent = section;
      let people = dom.getElementsByTagName('person');
      let ul = document.querySelector(`.${section} ul`);
      ul.innerHTML = Array.from(people)
        .map((person) => {
          return `<li>${person.textContent}</li>`;
          // return `<li>${person.firstChild.nodeValue}</li>`;
        })
        .join('');
    });
  })
  .catch((err) => {
    console.warn(err.message);
  });

document.body.addEventListener('click', async (ev) => {
  //find the section
  //delete the txt file that contains the xml file name
  //delete the xml file
  let section = ev.target.closest('section');
  let nm = section.querySelector('h1').textContent;
  let files = await myCache.matchAll(); //get all the files in the cache
  let urls = []; //text files ['one.txt', null, null, 'two.txt', null, 'three.txt']
  //txtFiles ['archer.xml', null, null, 'bobsburgers.xml', null, 'supernatural.xml']
  let txtFiles = await Promise.all(
    files.map((file) => {
      let url = new URL(file.url);
      if (url.pathname.endsWith('.txt')) {
        urls.push(url.pathname); //name of the txt file
        return file.text();
      } else {
        urls.push(null); //keep the length of the array the same as txtFiles
        return null;
      }
    })
  );
  txtFiles.map((fileContent, index) => {
    //if the txt file content matches the section name then delete the txt file and the xml file
    if (fileContent != null && fileContent.includes(nm)) {
      console.log('delete', urls[index], 'and', txtFiles[index]);
      myCache.delete(urls[index]); //don't need to wait for the result
      myCache.delete('./' + nm + '.xml'); //don't need to wait for the result
      section.remove();
      // section.parentElement.removeChild(section);
    }
  });
});

//find all the txt files in the cache
//read the xml file names from the txt files
//read all the xml files
//parse the xml files
//add the parsed xml files' person element text to the sections with names from <section name="name">

/*
<section class="archer">
      <h1>Archer</h1>
      <ul>
        <!-- add data here -->
      </ul>
    </section>
    <section class="burgers">
      <h1>Burgers</h1>
      <ul>
        <!-- add data here -->
      </ul>
    </section>
    <section class="supernatural">
      <h1>Supernatural</h1>
      <ul>
        <!-- add data here -->
      </ul>
    </section>
*/
