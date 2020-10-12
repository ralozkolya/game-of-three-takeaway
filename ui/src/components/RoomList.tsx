import React, { Component } from 'react';

import ListItem from './ListItem';

interface IRoomListProps {
    rooms: string[];
}

export default class RoomList extends Component<IRoomListProps> {
    
    render() {
        return (
            <>
                <h3>List of online users:</h3>
                {
                    this.props.rooms.length ?
                    <ul className="list-group">
                        { this.props.rooms.map((room, i) => <ListItem key={i} room={room} />) }
                    </ul> :
                    <h4>No rooms available</h4>
                }
            </>
        );
    }
}
