import React, { Component } from 'react';

import WSService from '../services/ws-service';

import RoomList from './RoomList';

interface AppState {
  messages: string[];
  rooms: string[];
}

export default class App extends Component {

  state: AppState = {
    messages: [],
    rooms: []
  };

  socket: SocketIOClient.Socket | null = null;

  componentDidMount(): void {

    this.socket = WSService.init();

    this.socket.on('message', (message: string) => {
      this.setState({ messages: [ ...this.state.messages, message ] });
    });

    this.socket.on('rooms', (rooms: string[]) => {
      this.setState({ rooms });
    });
  }

  createRoom = () => {
    this.socket?.emit('create-room');
  };

  render(): JSX.Element {
    return (
      <>
        <div className="container">
          <RoomList rooms={this.state.rooms} />
          <button onClick={this.createRoom} className="btn btn-success">Create a new room</button>
        </div>
      </>
    );
  }
}
