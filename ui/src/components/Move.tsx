import React, { Component } from 'react';
import { IMove } from '../services/ws-service';

import './Move.css';

interface IMoveProps {
  move: IMove;
}

export default class Game extends Component<IMoveProps> {

  showDifference = (diff: number, start: number): string | null => {
    
    if (0 === diff) {
      return `Got by dividing ${start} by 3`;
    }

    if (1 === diff) {
      return `Got by adding 1 to ${start} and dividing by 3`;
    }

    return `Got by subtracting 1 from ${start} and dividing by 3`;
  }

  render(): JSX.Element {

    const { move } = this.props;

    return (
      <div className="move-container clearfix">
        <div className="move">
          {
            undefined === move.difference ?
              <div>Starting number: { move.result }</div> :
              <>
                <div>Result: { move.result }</div>
                <div className="small">{ this.showDifference(move.difference, move.start) }</div>
              </>
          }
        </div>
      </div>
    );
  }
}
