import React, { Component } from 'react';

import ListItem from './ListItem';
import WSService from '../services/ws-service';

interface IRoomListProps {
  rooms: string[];
}

interface IRoomListState {
  room: string | null;
}

export default class RoomList extends Component<IRoomListProps, IRoomListState> {

  state = {
    room: null,
  };

  socket: SocketIOClient.Socket | null = null;

  componentDidMount(): void {

    this.socket = WSService.init();

    this.socket.on('joined-room', (room: string) => {
      this.setState({ room });
    });
  }

  render() {
    return (
      <>
        <h3>List of online users:</h3>
        {
          this.props.rooms.length ?
          <ul className="list-group">
            {
              this.props.rooms.map((room, i) => (
                <ListItem key={i} room={room} joinedRoom={this.state.room} />
              ))
            }
          </ul> :
          <h4>No rooms available</h4>
        }
      </>
    );
  }
}
