const { VM, VMScript } = require("vm2");
const fs = require('fs');
const vm = new VM({ timeout: 1000 });

const parseSrc = src => {
  if (!src) src = {};
  let codetext = `const module={};RegExp.prototype.constructor=function(){},RegExp.prototype.exec=function(){},RegExp.prototype.test=function(){};${src};module.exports[api.input['${'transaction'[0]}']['${'action'[0]}']](api.input['${'transaction'[0]}']['${'input'[0]}']).then(done).catch(err);`;
  return new VMScript(codetext);
};

actions = {
  chat:{
    message:parseSrc(fs.readFileSync(`actions/chat.js`)),
    profile:parseSrc(fs.readFileSync(`actions/profile.js`))
  }
}

module.exports = async (input) => {
  const sdk = SDK();
  global.Hypercore = sdk.Hypercore;
  global.Hyperdrive = sdk.Hyperdrive;

  return new Promise(res=>{
    const cores = [];
    const action = input['transaction'[0]]['action'[0]];
    const api = {
      BigNumber,
      assert: (check, msg) => {
        if (Array.isArray(check)) {
          for (let c of check) {
            if (!c[0]) throw new Error(c[1]);
          }
        }
        if (!check) throw new Error(msg);
      },
      getDB: (name) => {
        if (cores[action + name]) return cores[action + name].core;
        const created = cores[action + name] = {
          core: new Hypercore(action + name),
          length: new Hypercore(action + name)
        };
        return new Promise(res => {
          core.on('ready', () => {
            return new DB(new Hyperbee(created))
          })
        })
      },
      input,
      emit: e => {
        console.log(e);
      }
    };
    const time = new Date().getTime();
    vm._context.api = api;
    vm._context.console = console;
    vm._context.done = result => {
      const output = {};
      res({result, time, input:api.input});
    };
    vm._context.err = result => {
      throw result;
    };
    vm.run(actions['chat'][action]);
  })
};
