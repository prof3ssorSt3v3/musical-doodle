const files = ['./one.txt', './two.txt', './three.txt', './bobsburgers.xml', './archer.xml', './supernatural.xml'];
const cacheName = 'cache-xml-v1';
let myCache;

caches
  .open(cacheName)
  .then((cache) => {
    myCache = cache;
    return cache.addAll(files);
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
    return Promise.all(
      txtResponses.map((response) => {
        return response.text();
      })
    );
  })
  .then((strings) => {
    //find all the xml files from the strings in the txt files
    return Promise.all(strings.map((str) => myCache.match(str)));
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
      })
    );
  })
  .then((xmlStrings) => {
    //turn all the xml strings into xml documents
    let doms = xmlStrings.map((str) => {
      const parser = new DOMParser();
      return parser.parseFromString(str, 'application/xml');
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
        })
        .join('');
    });
  })
  .catch((err) => {
    console.warn(err.message);
  });

document.body.addEventListener('click', (ev) => {
  //find the section
  //delete the txt file that contains the xml file name
  //delete the xml file
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
