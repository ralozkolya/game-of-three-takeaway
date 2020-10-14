import React, { Component } from 'react';

import WSService from '../services/ws-service';
import Move from './Move';
import { IMove, getNextMove } from '../util/move';
import { Event } from '../enums/events';

interface IGameProps {
  onFinish?: () => void;
}

interface IGameState {
  moves: IMove[];
  finished: boolean;
}

export default class Game extends Component<IGameProps, IGameState> {

  state = {
    moves: [],
    finished: false
  };

  socket: SocketIOClient.Socket | null = null;

  componentDidMount(): void {

    this.socket = WSService.init();

    this.socket.on(Event.INIT, this.firstMove);

    this.socket.on(Event.MOVE, (move: IMove) => {

      this.setState({ moves: [...this.state.moves, move] });

      if (move.result > 1) {
        this.makeMove(move.result);
      } else {
        this.finish();
      }
    });

    this.socket.on(Event.START, this.startGame);
  }

  componentWillUnmount(): void {
    this.socket?.off(Event.MOVE);
    this.socket?.off(Event.INIT);
    this.socket?.off(Event.START, this.startGame);
  }

  startGame = (): void => {
    this.setState({ moves: [], finished: false });
  };

  firstMove = (): void => {
    const start = Math.floor(Math.random() * 990 + 10);
    const move = { start, result: start };
    WSService.sendMove(move);
    this.setState({ moves: [ move ] });
  };

  makeMove = (start: number): void => {

    const nextMove = getNextMove(start);

    this.setState({ moves: [...this.state.moves, nextMove] });

    WSService.sendMove(nextMove);

    if (nextMove.result <= 1) {
      this.finish();
    }
  };

  finish = () => {
    this.setState({ finished: true });
  };

  render(): JSX.Element {
    return (
      <>
        <h1>Game started</h1>
        {
          this.state.moves.map((move: IMove, i) => (
            <Move key={i} move={move} />
          ))
        }
        {
          this.state.finished ?
          <div className="my-5 text-center">
            <h3>Game finished!</h3>
            <button onClick={ this.props.onFinish } className="btn btn-primary">Exit?</button>
          </div> :
          null
        }
      </>
    );
  }
}
