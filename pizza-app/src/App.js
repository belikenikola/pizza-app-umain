import React, { useEffect, useState } from "react";
import Axios from "axios";
import * as geolib from "geolib";
import { convertDistance, getDistance } from "geolib";

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

  return (
    <div>
      {listOfRestaurants.length > 0 && (
        <ul>
          {listOfRestaurants.map((restaurants) => (
            <li key={restaurants.id}>
              {restaurants.name} | {restaurants.address1},{" "}
              {restaurants.address2}
            </li>
          ))}
        </ul>
      )}
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
