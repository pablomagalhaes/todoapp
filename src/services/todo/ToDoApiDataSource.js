import ApiDataSource, { UID_ASYNCSTORAGE_KEY } from "../ApiDataSource";
import ToDoConverter from "./ToDoConverter";
import firebase from "firebase/app";
import "firebase/database";
import AsyncStorage from "@react-native-community/async-storage";

class ToDoApiDataSource extends ApiDataSource {

  async getToDoList() {
    const USER_ID = await AsyncStorage.getItem(UID_ASYNCSTORAGE_KEY);
    return new Promise((resolve, reject) => {
      console.log("UID", USER_ID);
      firebase
        .database()
        .ref("users/" + USER_ID + "/toDoList")
        .once("value")
        .then(snapshot => {
          let toDoList = [];
          if (snapshot.val()) {
            const toDoListResponse = Object.values(snapshot.val());
            // toDoList = new ToDoConverter().mapperResponsesToEntities(
            toDoList = toDoListResponse
            // );
          } 
          console.log("response", snapshot.val());
          resolve(toDoList);
        });
    });
  }

  async saveToDo(toDo) {
    const newPostKey = toDo.id
      ? toDo.id
      : await firebase
          .database()
          .ref()
          .child("toDoList")
          .push().key;

    const newContact = new ToDoConverter().mapperEntityToRequest(
      toDo,
      newPostKey
    );
    var updates = {};

    updates[
      "users/" + this.USER_ID + "/toDoList/" + newPostKey
    ] = newContact;

    return new Promise((resolve, reject) => {
      firebase
        .database()
        .ref()
        .update(updates)
        .then(() => {
          resolve(toDo);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  removeToDo(toDo) {
    return new Promise((resolve, reject) => {
      const toDoKey = toDo.id;

      var removeToDoAction = {};
      removeToDoAction[
        "users/" + this.USER_ID + "toDoList/" + toDoKey
      ] = null;

      firebase
        .database()
        .ref()
        .update(removeToDoAction)
        .then(() => {
          resolve(toDo);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  async getUserId() {
  }
}

export default ToDoApiDataSource;
