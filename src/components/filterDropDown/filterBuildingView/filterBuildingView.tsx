import React, { useState, useEffect, SetStateAction } from "react";
import Select from "react-select";
import axios from "axios";

type Metadata = { label: string; value: string }[];
const defaultResponse = [{ label: "none", value: "none" }];

type Filter = {
  problemTypes: string[];
  objectTypes: string[];
  networkSystemTypes: string[];
  networkSystems: string[];
};

const defaultFilter = {
  problemTypes: [],
  objectTypes: [],
  networkSystemTypes: [],
  networkSystems: []
};

let objectTypesResponse: Metadata = [];
let networkTypesResponse: Metadata = [];
let networkSystemsResponse: Metadata = [];
let problemTypesResponse: Metadata = [];

let properties = [
  { propertyName: "objectTypes", list: objectTypesResponse },
  { propertyName: "networkSystems", list: networkSystemsResponse },
  { propertyName: "networkSystemTypes", list: networkTypesResponse },
  { propertyName: "problemTypes", list: problemTypesResponse }
];

const FilterBuildingView: React.FC = () => {
  const [filter, setFilter] = useState<Filter>(defaultFilter);

  const [objectTypes, setobjectTypes] = useState<Metadata>(defaultResponse);
  const [problemTypes, setProblemTypes] = useState<Metadata>(defaultResponse);
  const [networkSystemTypes, setNetworkSystemTypes] = useState<Metadata>(
    defaultResponse
  );
  const [networkSystems, setNetworkSystems] = useState<Metadata>(
    defaultResponse
  );

  useEffect(() => {
    fetchProblemTypes();
  }, []);

  const postNewFilter = async () => {
    await axios({
      url: "http://localhost:8000/notificationprofiles/filters",
      method: "POST",
      headers: {
        Authorization: "Token " + localStorage.getItem("token")
      },
      data: {
        name: "filter1",
        filter: JSON.stringify(filter)
      }
    });
  };

  const fetchProblemTypes = async () => {
    await axios({
      url: "http://localhost:8000/alerts/metaData",
      method: "GET",
      headers: {
        Authorization: "Token " + localStorage.getItem("token")
      }
    }).then(result => {
      properties.map(p => {
        result.data[p.propertyName].map((obj: any) => {
          p.list.push({
            label: obj.name,
            value: obj.name
          });
        });
      });
    });
    setProblemTypes(problemTypesResponse);
    setNetworkSystemTypes(networkTypesResponse);
    setobjectTypes(objectTypesResponse);
    setNetworkSystems(networkSystemsResponse);
  };

  type OptionsType = [{ label: string; value: string }];
  const handleChange = (value: any, property: string) => {
    let newFilter: any = filter;
    newFilter[property] = value
      ? value.map((obj: any) => {
          return obj.value;
        })
      : [];
    setFilter(newFilter);
  };

  const handleCreate = () => {
    postNewFilter();
  };

  return (
    <div>
      <h1>Build your custom filter here for only 9.99$!!! </h1>
      <p>Select alarm type</p>
      <Select
        isMulti
        name="bois"
        options={problemTypes}
        onChange={value => handleChange(value, "problemTypes")}
      ></Select>
      <p>Select objectTypes</p>
      <Select
        isMulti
        name="boiss"
        options={objectTypes}
        onChange={value => handleChange(value, "objectTypes")}
      ></Select>
      <p>Select netWorkSystemTypes</p>
      <Select
        isMulti
        name="boisss"
        options={networkSystemTypes}
        onChange={value => handleChange(value, "networkSystemTypes")}
      ></Select>
      <p>Select netWorkSystems</p>
      <Select
        isMulti
        name="boissss"
        options={networkSystems}
        onChange={value => handleChange(value, "networkSystems")}
      ></Select>
      <button onClick={handleCreate}>create</button>
    </div>
  );
};

export default FilterBuildingView;
