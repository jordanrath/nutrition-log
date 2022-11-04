import FetchWrapper from "./fetch-wrapper.js";
import { capitalize, calculateCalories } from "./helpers.js";
import snackbar from "/node-snackbar";
import AppData from "./app-data.js";
import { API } from "./store2api.js";
import "node-snackbar/dist/snackbar.min.css";
// import "snackbar/dist/snackbar.min.css"; 

import Chart from "chart.js/auto";

const appData = new AppData();

const snackbarDefault = {
  duration: 3000,
  pos: 'top-center',
  width: '500',
  textColor: '#777'
};
const list = document.querySelector("#food-list");
const form = document.querySelector("#create-form");
const name = document.querySelector("#create-name");
const carbs = document.querySelector("#create-carbs");
const protein = document.querySelector("#create-protein");
const fat = document.querySelector("#create-fat");

const registerCloseBtns = () => {
  const cardClosers = document.querySelectorAll(".delete-btn");
  cardClosers.forEach((card, index) => {
    if (card.oldOnClick) {
      card.removeEventListener('click', card.oldOnClick)
    }

    const newOnClick = () => {
      handleCardClose(index, card);
    };

    card.addEventListener('click', newOnClick)
    card.oldOnClick = newOnClick;
  })
}

const handleCardClose = (position, card) => {
  API.post("/close", {
    position
  }).then((data) => {
    if (data.error) {
      console.error(data.error)
      snackbar.show({
        ...snackbarDefault, 
        text: "Unable to remove item."
      })
    } else {
      card.parentNode.parentNode.remove();
      snackbar.show({
        ...snackbarDefault, 
        text: "Removed item."
      });
      appData.removeFood(position);
      render();
    }
  });
}

const displayEntry = (name, carbs, protein, fat) => {
  appData.addFood(carbs, protein, fat);
  list.insertAdjacentHTML(
    "beforeend",
    `<li class="card">
        <div>
          <h3 class="name">${capitalize(name)}</h3>
          <button type="button" class="delete-btn">Close</button>
          <div class="calories">${calculateCalories(
            carbs,
            protein,
            fat
          )} calories</div>
          <ul class="macros">
            <li class="carbs"><div>Carbs</div><div class="value">${carbs}g</div></li>
            <li class="protein"><div>Protein</div><div class="value">${protein}g</div></li>
            <li class="fat"><div>Fat</div><div class="value">${fat}g</div></li>
          </ul>
        </div>
      </li>`
  );
};

form.addEventListener("submit", (event) => {
  event.preventDefault();

  API.post("/", {
    fields: {
      name: { stringValue: name.value },
      carbs: { integerValue: carbs.value },
      protein: { integerValue: protein.value },
      fat: { integerValue: fat.value },
    },
  }).then((data) => {
    console.log(data);
    if (data.error) {
      // there was an error
      snackbar.show({
        ...snackbarDefault, 
        text: "Some data is missing."
      });
      return;
    }

    snackbar.show({
      ...snackbarDefault, 
      text: "Food added successfully."
    });

    displayEntry(name.value, carbs.value, protein.value, fat.value);
    render();

    name.value = "";
    carbs.value = "";
    protein.value = "";
    fat.value = "";
  });
});

const init = () => {
  API.get("/").then((data) => {
    data.forEach((item) => {

      displayEntry(
        item.name,
        item.carbs,
        item.protein,
        item.fat
      );
    });
    render();
  });
};

let chartInstance = null;
const renderChart = () => {
  chartInstance?.destroy();
  const context = document.querySelector("#app-chart").getContext("2d");

  chartInstance = new Chart(context, {
    type: "bar",
    data: {
      labels: ["Carbs", "Protein", "Fat"],
      datasets: [
        {
          label: "Macronutrients",
          data: [
            appData.getTotalCarbs(),
            appData.getTotalProtein(),
            appData.getTotalFat(),
          ],
          backgroundColor: ["#25AEEE", "#FECD52", "#57D269"],
          borderWidth: 3, // example of other customization
        },
      ],
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  });
};

const totalCalories = document.querySelector("#total-calories");

const updateTotalCalories = () => {
  totalCalories.textContent = appData.getTotalCalories();
};

const render = () => {
  renderChart();
  updateTotalCalories();
  registerCloseBtns();
};

init();
