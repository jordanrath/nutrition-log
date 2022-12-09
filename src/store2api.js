import store from '/store2';

const create404Response = async () => {
    return {
        error: "Could not find the service requested"
    }
}

const createFoodItem = async (data) => {
    const { fields = {} } = data;
    const { name: nameRaw = {}, carbs: carbsRaw = {}, protein: proteinRaw = {}, fat: fatRaw = {} } = fields;
    const { stringValue: name = null } = nameRaw;
    const { integerValue: carbsStr = 0 } = carbsRaw;
    const { integerValue: proteinStr = 0 } = proteinRaw;
    const { integerValue: fatStr = 0 } = fatRaw;
    const carbs = parseInt(carbsStr);
    const protein = parseInt(proteinStr);
    const fat = parseInt(fatStr);
    //null check on name
    if (typeof name != 'string') {
        return {
            error: "Name is a required field and cannot be null"
        }
    }

    if (typeof carbs != 'number' || typeof protein != 'number' || typeof fat != 'number') {
        return {
            error: "Nutritional Info (carbs, protein, fat) must be numbers"
        }
    }

    const newFood = {
        name: name, 
        carbs: carbs, 
        protein: protein, 
        fat: fat,
    };
    let currentFood = store.get('food-items');
    currentFood = (currentFood instanceof Array ? currentFood : []);
    currentFood.push(newFood);
    await setFoodItems(currentFood);
    return {
        newCount: currentFood.length,
        newItem: newFood,
    }
}
    const setFoodItems = async (items) => {
        store.set("food-items", items, true);
    }

    const getFoodItems = async (data) => {
        let currentFood = store.get('food-items');
        currentFood = (currentFood instanceof Array ? currentFood : []);
        return currentFood;
    }

    const removeFoodItem = async (data) => {
        const { position = -1 } = data;
        const curFood = await getFoodItems();
        if (curFood.length > position && position >= 0) {
            curFood.splice(position, 1);
            await setFoodItems(curFood);
            return {};
        }
        return {
            error: "Unable to find an item to remove."
        }
    }

export const API = {
    post: async (path, data) => {
        switch(path) {
            case "/": return createFoodItem(data);
            case "/close": return removeFoodItem(data);
            default: return create404Response();
        }
    },
    get: async (path, data) => {
        switch(path) {
            case "/": return getFoodItems(data);
            default: return create404Response();
        }
    },
}