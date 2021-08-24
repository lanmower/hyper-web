module.exports = {
    profile:async ()=>{
        console.log(api.getDB('profiles')); 
        return 'test';
    }
}