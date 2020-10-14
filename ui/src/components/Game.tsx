import React, { Component } from 'react';

import WSService, { IMove } from '../services/ws-service';
import Move from './Move';

interface IGameProps {
  onFinish?: () => void;
}

interface IGameState {
  moves: IMove[];
  finished: boolean;
}

type Difference = -1 | 0 | 1;

export default class Game extends Component<IGameProps, IGameState> {

  state = {
    moves: [],
    finished: false
  };

  socket: SocketIOClient.Socket | null = null;

  componentDidMount(): void {

    this.socket = WSService.init();

    this.socket.on('init', this.firstMove);

    this.socket.on('move', (move: IMove) => {

      this.setState({ moves: [...this.state.moves, move] });

      if (move.result > 1) {
        this.makeMove(move.result);
      } else {
        this.finish();
      }
    });

    this.socket.on('start', this.startGame);
  }

  componentWillUnmount(): void {
    this.socket?.off('move');
    this.socket?.off('init');
    this.socket?.off('start', this.startGame);
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

    const difference = start % 3 ? (1 === start % 3 ? -1 : 1) : 0;

    const nextMove: IMove = {
      start: start,
      difference,
      result: (start + difference) / 3
    };

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
