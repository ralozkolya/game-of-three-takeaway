import React, { Component } from 'react';

import WSService from '../services/ws-service';

import RoomList from './RoomList';
import Game from './Game';
import { Event } from '../enums/events';

interface IAppState {
  rooms: string[];
  inGame: boolean;
  connected: boolean;
}

export default class App extends Component<any, IAppState> {

  state = {
    rooms: [],
    inGame: false,
    connected: false
  };

  socket: SocketIOClient.Socket | null = null;

  componentDidMount(): void {

    this.socket = WSService.init();

    this.socket.on(Event.ROOMS, (rooms: string[]) => {
      this.setState({ rooms });
    });

    this.socket.on(Event.CONNECT, () => this.setState({ connected: true }));

    this.socket.on(Event.RESET, this.reset);

    this.socket.on(Event.START, () => {
      this.setState({ inGame: true });
    });

    this.socket.on(Event.DISCONNECT, this.reset);
  }

  reset = (): void => {
    this.setState({ inGame: false });
  };

  render(): JSX.Element {
    return (
      <>
        <div className="container mt-5">
          <div className="row">
            <div className="col-md-8 mb-3">
              {
                this.state.inGame ?
                <Game onFinish={ this.reset } /> :
                <>
                  <h3>Choose a game from the list</h3>
                  <button disabled={!this.state.connected}
                    onClick={ () => WSService.startGame() }
                    className="btn btn-primary mt-3">
                    Or play against the server
                  </button>
                </>
              }
            </div>
            <div className="col-md-4 mb-3">
              <RoomList rooms={ this.state.rooms } />
              <button disabled={this.state.inGame || !this.state.connected}
                onClick={ () => WSService.createRoom() }
                className="btn btn-success mt-3">
                Create a new room
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
}
