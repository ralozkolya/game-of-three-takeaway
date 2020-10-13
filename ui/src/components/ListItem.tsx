import React, { Component } from 'react';

import WSService from '../services/ws-service';

interface IListItemProps {
  room: string;
  joinedRoom: string | null;
}

export default class ListItem extends Component<IListItemProps> {

  render() {

    const { room, joinedRoom } = this.props;

    return (
      <li className="list-group-item">
        { room.substr(1) }
        {
          joinedRoom === room ?
          <button disabled
            className="btn btn-primary btn-sm float-right">
            Joined
          </button> :
          <button
            onClick={ () => WSService.joinRoom(room) }
            className="btn btn-primary btn-sm float-right">
            Play
          </button>
        }
      </li>
    );
  }
}
