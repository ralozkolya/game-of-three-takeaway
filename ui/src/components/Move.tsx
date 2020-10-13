import React, { Component } from 'react';
import { IMove } from '../services/ws-service';

import './Move.css';

interface IMoveProps {
  move: IMove;
}

export default class Game extends Component<IMoveProps> {

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
                <div className="small">
                  Got by adding { move.difference } to { move.start } and dividing by 3
                </div>
              </>
          }
        </div>
      </div>
    );
  }
}
