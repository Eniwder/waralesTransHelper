import fs from 'fs';


// const ja = JSON.parse(fs.readFileSync('intermediate/export_ja_kv.json', 'utf8'));
const ja = JSON.parse(fs.readFileSync('intermediate/export_ja_kv4.json', 'utf8'));

const invalid = ja.filter(({ path, text }) => {
  const open = text.match(/<[a-zA-Z]+?>/g);
  const clone = text.match(/<\/[a-zA-Z]+?>/g);
  // console.log(path, open, clone);
  return (open && clone && open.length !== clone.length);
});

console.log(invalid);