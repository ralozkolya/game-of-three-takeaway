import React, { Component } from 'react';

import WSService from '../services/ws-service';

import RoomList from './RoomList';
import Game from './Game';

interface IAppState {
  rooms: string[];
  inGame: boolean;
}

export default class App extends Component<any, IAppState> {

  state = {
    rooms: [],
    inGame: false,
  };

  socket: SocketIOClient.Socket | null = null;

  componentDidMount(): void {

    this.socket = WSService.init();

    this.socket.on('rooms', (rooms: string[]) => {
      this.setState({ rooms });
    });

    this.socket.on('reset', this.reset);

    this.socket.on('start', () => {
      this.setState({ inGame: true });
    });

    this.socket.on('disconnect', this.reset);
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
                  <button
                    onClick={ () => WSService.startGame() }
                    className="btn btn-secondary mt-3">
                    Or play against the computer
                  </button>
                </>
              }
            </div>
            <div className="col-md-4 mb-3">
              <RoomList rooms={ this.state.rooms } />
              <button disabled={this.state.inGame}
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
