import { StatusBar } from 'expo-status-bar';
import React, { Component} from 'react';
import ReactDOM, { render } from "react-dom";
import { StyleSheet, Text, View, TextInput, Button, Alert, FlatList, Picker, ActivityIndicator, Image } from 'react-native';
import { ListItem, Avatar } from 'react-native-elements'
import { ApolloClient, InMemoryCache } from '@apollo/client';
import {  useQuery, gql } from '@apollo/client';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';



const client = new ApolloClient({
  uri: 'https://relevator.herokuapp.com/graphql',
  cache: new InMemoryCache()
});

const EMPLOYEE = gql`
query getEmployee($email: String!){
  getEmployee(email: $email){
      id
  }
}
`;

const ELEVATORS = gql`
query {
  elevatorList{
      id
      status
  }
}
`;

const UPDATE = gql`
mutation updateElevator($id: Int!, $status: String!){
  updateElevator(id: $id, status: $status){
      id
      status
  }
}
`;

class Login extends Component {
  constructor(props) {
      super(props);
      this.toggleClass = this.toggleClass.bind(this);
      this.email = {value: ""};
  }
  state = {
    animate: false,
    email: "",
  };
  toggleClass() {
    this.setState({animate: true})
    //alert(this.email)
    client
    .query({
      query: EMPLOYEE, variables: {email: this.state.email}
    })
    .then(result => {
      if(result.data.getEmployee != null){
      client
      .query({
        query: ELEVATORS
      })
      .then(result => {
        //alert(JSON.stringify(result));
        this.props.navigation.navigate('ListElevators', {result})
      });
    }else{
      alert("Try again")
      this.setState({animate: false})
    }
      });
    
     //alert(this.email.value)
     //nicolas.genest@codeboxx.biz
  }

 

  render() {
      return (
        
        <View style={styles.container}>
          <Image source={require('./assets/R2.png')} style={styles.logo}/>
          <ActivityIndicator animating={this.state.animate}/>
         <Text>Email : </Text>
         <TextInput value={this.state.email} style={{margin:10, height: 40, width:100, borderColor: 'gray', borderWidth: 1 }}
      onChangeText={text => this.setState({email: text})} />
        <Button
  onPress={()=>{this.toggleClass()}}
  title="Login"
  color="#141584"
/>
</View>
      )
}


}
class Item extends Component{
  constructor(props){
    super(props)
    this.onPress = this.onPress.bind(this);
  }

  onPress(){
    //alert(this.props.id);
    this.props.navigation.navigate('Elevators', {id: this.props.id,status: this.props.status})
  }

  render(){
    return(
    <View style={styles.item} >
    <Text style={styles.title}>Elevator : {this.props.id}</Text>
    <Text >{this.props.status}</Text>
    <Button
  onPress={()=>this.onPress()}
  title="Change status"
  color="#141584"
/>
  </View>);
  }
}


class ListElevator extends Component {
  constructor(props){
    super(props)
  }

  
 
    renderItem = ({ item }) => (
    <Item id={item.id} status={item.status} navigation={this.props.navigation} />
  );
  
  render(){
    const {result} = this.props.route.params
    return (
      <View style={styles.container}>
      <FlatList
      data={result.data.elevatorList}
      renderItem={this.renderItem}
      keyExtractor={item => item.id}
/>
  
      </View>
    );
  }
}

class Elevator extends Component {
  constructor(props){
    super(props)
    this.onPress = this.onPress.bind(this);
  }

  state = {
    value: 'active',
    animate: false,
  };

  onPress(){
   // alert(this.state.value);
   this.setState({animate: true})
    client
    .mutate({
      mutation: UPDATE, variables: {id: this.props.route.params.id, status: this.state.value}
    })
    .then(result => {
      client
      .query({
        query: ELEVATORS
      })
      .then(result => {
        //alert(JSON.stringify(result));
        this.props.navigation.navigate('ListElevators', {result})
      });
    })
  }


  render(){
    const {params} = this.props.route
    //alert(JSON.stringify(params))
    return (
      
      <View style={styles.container}>
        <ActivityIndicator animating={this.state.animate}/>
        <Text>Elevator: {params.id}</Text>
        <Text>{params.status}</Text>
        <Picker
  selectedValue={this.state.value}
  style={{height: 50, width: 100}}
  onValueChange={(itemValue, itemIndex) =>
    this.setState({value: itemValue})
  }>
  <Picker.Item label="Active" value="active" />
  <Picker.Item label="Inactive" value="inactive" />
  <Picker.Item label="Intervention" value="intervention" />
</Picker>
        <Button
  onPress={()=>this.onPress()}
  title="Change status"
  color="#141584"
/>
      </View>
    );
  }
}

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="ListElevators" component={ListElevator} />
        <Stack.Screen name="Elevators" component={Elevator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 315,
    height: 110,
    marginBottom: 20,
  },
  instructions: {
    color: '#888',
    fontSize: 18,
    marginHorizontal: 15,
    marginBottom: 10,
  },
});


export default App;
