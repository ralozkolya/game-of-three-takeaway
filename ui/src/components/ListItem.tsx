import React, { Component } from 'react';

interface IListItemProps {
    room: string;
}

export default class ListItem extends Component<IListItemProps> {
    
    render() {
        return (
            <li className="list-group-item">
                { this.props.room }
                <button className="btn btn-primary btn-sm float-right">Play</button>
            </li>
        );
    }
}
