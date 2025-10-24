# jsondiff

Taking two javascript objects, using a template return the difference, another method to reconstruct the original json.

Note that a special tag "$$case" and "$$else" exist in template when a single field in the input gates the use of a different template.  the field used in the template cannot exist in the child template.

```javascript
const input = {
  name: "Alice",
  favorite: "Blue",
  age: 30,
  address: {
    city: "Paris",
    zip: 75000
  },
  item : [
     {
         type : "dishwasher",
         brand : "Maytag",
         year  : 1980
     },
     {
         type : "shoes",
         brand : "Nike",
         color  : "red"
     },
     {
         type : "shoes",
         brand : "Keds",
         color  : "white"
     }
  ],
  hobbies: ["music", "art"]
};

const template = {
  name: "Alice",
  favorite: "Blue",
  age: 0,
  address: {
    city: "",
    zip: 0
  },
  item : [
    {
      "$$case" : [
         {
             "name" : "type",
             "value" : "dishwasher" ,
             "template" : {
                 brand : "Maytag"
             }
         },
         {
             "name" : "type",
             "value" : "shoes" ,
             "template" : {
                 brand : "Nike",
                 color : "white"
             }
         }
      ]
    }
  ],
  hobbies: []
};

const diff = jsondiff.jsonDiff(input, template);
console.log("DIFF:", JSON.stringify(diff, null, 2));

const reconstructed = jsondiff.jsonPatch(diff, template);
console.log("RECONSTRUCTED:", JSON.stringify(reconstructed, null, 2));
```
