import React, { useEffect, useState } from "react";
import Axios from "axios";
import * as geolib from "geolib";
import { convertDistance, getDistance } from "geolib";
import axios from "axios";

function App() {
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [status, setStatus] = useState(null);
  const [havevCoords, setHaveCoords] = useState(null);

  let sortedRes = [];
  let coordsRes = [];

  const getLocation = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported by your browser...");
    } else {
      setStatus("Locating...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setStatus(null);
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
          setHaveCoords(true);
        },
        () => {
          setStatus("Unable to retrive your location.");
        }
      );
    }
  };

  const [listOfRestaurants, setList] = useState([]);

  if (lat && lng) {
    console.log(lat, lng);
    listOfRestaurants.map((res) =>
      coordsRes.push({ latitude: res.latitude, longitude: res.longitude })
    );
    console.log(coordsRes);
    sortedRes = geolib.orderByDistance({ latitude: +lat, longitude: +lng }, [
      {
        latitude: listOfRestaurants[0].latitude,
        longitude: listOfRestaurants[0].longitude,
      },
      {
        latitude: listOfRestaurants[1].latitude,
        longitude: listOfRestaurants[1].longitude,
      },
    ]);
    console.log(listOfRestaurants);
    console.log("Option 1, sorted restaurants", sortedRes);
  }

  const getListOfRestaurants = () => {
    Axios.get(
      "https://private-anon-30c6323958-pizzaapp.apiary-mock.com/restaurants/"
    ).then((response) => {
      console.log(response);
      const myList = response.data;
      setList(myList);
    });
  };

  useEffect(() => {
    getListOfRestaurants();
  }, []);

  sortedRes = listOfRestaurants.sort(function (a, b) {
    var diffA = Number(a.latitude) - lat + (Number(a.longitude) - lng);
    var diffB = Number(b.latitude) - lat + (Number(b.longitude) - lng);

    if (diffA > diffB) {
      return 1;
    } else if (diffA < diffB) {
      return -1;
    } else {
      return 0;
    }
  });
  console.log("Option 2, sorted restaurants:", sortedRes);
  let distance;
  let distanceInKm;
  if (sortedRes.length > 0 && lat && lng) {
    distance = getDistance(
      { latitude: +lat, longitude: +lng },
      { latitude: sortedRes[0].latitude, longitude: sortedRes[0].longitude }
    );
    distanceInKm = convertDistance(distance, "km");
    console.log("Distance:", distance);
    console.log("Distance in km:", distanceInKm);
  }

  const handleEvent = (id) => {
    console.log("Radi");
    console.log(id);
    setRestaurantId(id);

    Axios.get(
      `https://private-anon-e33bded453-pizzaapp.apiary-mock.com/restaurants/${id}/menu?category=Pizza&orderBy=rank`
    ).then((data) => {
      console.log(data.data);
      setMenu(data.data);
    });
  };

  const [menu, setMenu] = useState([]);

  const [cart, setCart] = useState([]);

  const [restuarantId, setRestaurantId] = useState(null);

  const [orderReceived, setOrderReceived] = useState(null);

  const [orderInfo, setOrderInfo] = useState(null);

  const addToCart = (id, name) => {
    console.log(id);
    setCart([
      ...cart,
      {
        menuItemId: id,
        quantity: 1,
        name: name,
      },
    ]);
    console.log(cart);
  };

  const postOrder = () => {
    axios
      .post(
        "https://private-anon-0195f60de5-pizzaapp.apiary-mock.com/orders/",
        {
          cart: [...cart],
          restuarantId: restuarantId,
        }
      )
      .then((res) => {
        setOrderReceived(res.data.orderId);
        const orderId = res.data.orderId;
        axios
          .get(
            "https://private-anon-0195f60de5-pizzaapp.apiary-mock.com/orders/id"
          )
          .then((resGet) => {
            console.log("res get metode ");
            console.log(resGet);

            setOrderInfo({
              status: resGet.data.status,
              totalPrice: resGet.data.totalPrice,
            });
          });
      });
  };

  return (
    <div>
      {listOfRestaurants.length > 0 && (
        <ul>
          {listOfRestaurants.map((restaurants) => (
            <li
              key={restaurants.id}
              onClick={() => {
                handleEvent(restaurants.id);
              }}
            >
              {restaurants.name} | {restaurants.address1},{" "}
              {restaurants.address2}
            </li>
          ))}
        </ul>
      )}
      <hr></hr>

      <div>
        <h3>Cart</h3>
        {cart.length > 0 &&
          cart.map((el, index) => {
            return <div key={index}>{el.name}</div>;
          })}
        <button onClick={() => postOrder()}>Order</button>
        {orderInfo && (
          <div>
            <div>status : {orderInfo.status} </div>
            <div>total price : {orderInfo.totalPrice} </div>
          </div>
        )}
      </div>
      <hr></hr>
      <div></div>

      <hr></hr>
      <div>
        {menu.length > 0 && (
          <ul>
            {menu.map((el) => {
              return (
                <div
                  key={el.id}
                  onClick={() => {
                    addToCart(el.id, el.name);
                  }}
                >
                  {el.name}
                </div>
              );
            })}
          </ul>
        )}
      </div>
      <button onClick={getLocation}>Get location</button>
      <h1>Coordinates</h1>
      <p>{status}</p>
      {lat && <p>Latitude: {lat}</p>}
      {lng && <p>Longitude: {lng}</p>}
      {havevCoords && (
        <p>
          Your closest restaurant is {sortedRes[0].name}, and distance from you
          is {distanceInKm} km.
        </p>
      )}
    </div>
  );
}

export default App;
