/**
 * Recursively compute the difference between two JSON objects.
 * Returns an object that contains only keys from `input`
 * whose values differ from `template`.
 */
function jsonDiff(input, template) {
  if (typeof input !== 'object' || input === null) {
    // Base case: primitive values
    if (input !== template) {
      return input;
    } else {
      return undefined;
    }
  }
  if(typeof template == 'object' && !Array.isArray(template) && !Array.isArray(input) ) {
     const cases = template["$$case"]; // Match patterns provide alternates - use current template otherwise
     if( cases ) {
        for( let i = 0 ; i < cases.length ; ++i ) {
            if( input[cases[i].name] == cases[i].value ) {
                return jsonDiff(input,cases[i].template);
            }
        }
        // If no cases match, provide an else
        if( template["$$else"] ) {
            return jsonDiff(input,template["$$else"]);
        }
        return input;
     }
  }

  if (Array.isArray(input)) {
    if (!Array.isArray(template)) return input; // type mismatch
    if( template.length == 0 ) {
        if( input.length == 0 ) return undefined;
    } else if( template.length == 1 && typeof template[0] == 'object' ) {     
      return input.map((item, i) => jsonDiff(item, template[0]));
    } else {
      const diffArr = input.map((item, i) => jsonDiff(item, template[i]));
      // Filter out undefineds where there are no diffs
      if (diffArr.every(v => v === undefined)) return undefined;
      return diffArr;
    }
  }

  // Otherwise handle as plain object
  const diff = {};
  let hasDiff = false;

  for (const key of Object.keys(input)) {
    const subDiff = jsonDiff(input[key], template ? template[key] : undefined);
    if (subDiff !== undefined) {
      diff[key] = subDiff;
      hasDiff = true;
    }
  }

  return hasDiff ? diff : undefined;
}

/**
 * Recursively applies a diff object onto a template
 * to reconstruct the original input.
 */
function jsonPatch(diff, template) {
  if (diff === undefined) return template;

  if (typeof diff !== 'object' || diff === null) {
    // Base case: primitive value
    return diff;
  }
  if(typeof template == 'object' && !Array.isArray(template) && !Array.isArray(input) ) {
     const cases = template["$$case"]; // Match patterns provide alternates - use current template otherwise
     if( cases ) {
        for( let i = 0 ; i < cases.length ; ++i ) {
            if( diff[cases[i].name] == cases[i].value ) {
                return jsonPatch(diff,cases[i].template);
            }
        }
        // If no cases match, provide an else
        if( template["$$else"] ) {
            return jsonPatch(diff,template["$$else"]);
        }
        return diff;
     }
  }
  if (Array.isArray(diff)) {
    if (!Array.isArray(template)) return diff; // type mismatch
    if( template.length == 0 ) {
        // If its an unitialized array
        return diff;
    }
    if( template.length == 1 && typeof template[0] == 'object' ) {
      // Its reused template object 
      const result = [];
      for (let i = 0; i < diff.length; i++) {
        result.push(jsonPatch(diff[i],template[0]));
      }
      return result;
    } else {
      const result = [];
      const maxLength = Math.max(diff.length, (template || []).length);
      for (let i = 0; i < maxLength; i++) {
        result[i] = jsonPatch(diff[i], template ? template[i] : undefined);
      }
      return result;
    }
  }

  const result = { ...(template || {}) };
  for (const key of Object.keys(diff)) {
    result[key] = jsonPatch(diff[key], template ? template[key] : undefined);
  }
  return result;
}

exports.jsonDiff = jsonDiff;
exports.jsonPatch = jsonPatch;


