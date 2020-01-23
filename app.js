const { Component, useState } = owl;
const { useRef, onPatched } = owl.hooks;
const { Portal } = owl.misc;

var app; // set app as global

//------------------------------------------------------------------------------
// Synchronous Simple Prompt declaration
//------------------------------------------------------------------------------

/**
 * Utility function used to loop until `pred` is satisfied.
 * It blocks the stack where it is called, but not the event loop
 * because it yields control every 100ms.
 *
 * @param {Function} pred
 */
function until(pred) {
    const poll = resolve => {
        if (pred()) resolve();
        else setTimeout(_ => poll(resolve), 100);
    };
    return new Promise(poll);
}

class Modal extends Component {}
Modal.components = { Portal };

class SimplePrompt extends Component {
    constructor() {
        super(...arguments);
        this.message = this.props.message;
        this.succeed = false;
        this.cancelled = false;
        this.value = "";
        this.inputRef = useRef("input");
    }
    mounted() {
        this.inputRef.el.focus();
    }
    enterOrEsc(event) {
        if (event.which === 13) {
            this.ok();
        } else if (event.which === 27) {
            this.cancel();
        }
    }
    ok() {
        this.succeed = true;
        this.value = this.inputRef.el.value;
    }
    cancel() {
        this.cancelled = true;
    }
}
SimplePrompt.components = { Modal };
SimplePrompt.show = async function(message) {
    return await showDialog(SimplePrompt, { message });
}

async function showDialog(dialogComponent, props) {
    try {
        // use global `app` as parent of dialog
        const dialog = new dialogComponent(app, props);
        // show the dialog
        dialog.mount(document.body);
        // wait until the dialog succeeds or fails
        // this is async so the event loop is not blocked
        await until(() => dialog.succeed || dialog.cancelled);
        // remove the dialog from dom
        dialog.unmount();
        // return or throw error
        if (dialog.succeed) return dialog.value;
        if (dialog.cancelled) throw { error: "Cancelled" };
    } catch (error) {
        throw error;
    }
}

//------------------------------------------------------------------------------
// App declaration
//------------------------------------------------------------------------------

class App extends Component {
    constructor() {
        super(...arguments);
        this.state = useState({
            text: "Hello",
        });
    }
    async getUserName() {
        try {
            let name = await SimplePrompt.show("What is your name?");
            while (name === "Joseph") {
                name = await SimplePrompt.show(
                    "That's not a valid name. Try again."
                );
            }
            name = name === "" ? "World" : name;
            this.state.text = `Hello ${name}!`;
        } catch ({ error }) {
            if (error === "Cancelled") {
                this.state.text = "You're bad. Don't cancel it!";
            }
        }
    }
}
App.components = { SimplePrompt };

//------------------------------------------------------------------------------
// App initialization
//------------------------------------------------------------------------------

async function start() {
    const templates = await owl.utils.loadFile("templates.xml");
    App.env = { qweb: new owl.QWeb({ templates }) };
    app = new App();
    const target = document.getElementById("main");
    await app.mount(target);
}

start();
