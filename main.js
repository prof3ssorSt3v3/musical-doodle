const files = ['./one.txt', './two.txt', './three.txt', './bb.xml', './arch.xml', './super.xml'];
const cacheName = 'cache-xml-v1';
let myCache;

caches
  .open(cacheName)
  .then((cache) => {
    return cache.addAll(files);
  })
  .then(() => {
    //all the files are in the cache
  })
  .catch((err) => {
    console.warn(err.message);
  });

//find all the txt files in the cache
//read the xml file names from the txt files
//read all the xml files
//parse the xml files
//add the parsed xml files' person element text to the sections with names from <section name="name">
