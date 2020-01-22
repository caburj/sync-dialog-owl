# Description

This shows a possible implementation of 'synchronous' dialog made of Modal
as alternative to the standard prompt. The standard prompt is not customizable,
however, it is shown here that we can create a customizable prompt (or perhaps
a more sophisticated one like a wizard).

So instead of the following code:

```js
function greet() {
    let name = prompt("What is your name?");
    while (name === "Joseph") {
        name = prompt(
            "That's not a valid name. Try again."
        );
    }
    name = name === "" ? "World" : name;
    console.log(`Hello ${name}!`);
}
```

we can do the following:

```js
// Assuming newPrompt is created. (In the source, showSimplePrompt is used.)

async function greet() {
    let name = await newPrompt("What is your name?");
    while (name === "Joseph") {
        name = await newPrompt(
            "That's not a valid name. Try again."
        );
    }
    name = name === "" ? "World" : name;
    console.log(`Hello ${name}!`);
}
```

Notice the use of `await` in the new implementation. It means the event loop
is not blocked when using the new prompt.
