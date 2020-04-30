import React, { Component } from "react";
import { HistoryTokenGridHeader } from "./HistoryTokenGridHeader";
import { IHistoryTokenGridRowProps, HistoryTokenGridRow } from "./HistoryTokenGridRow";
import { HistoryTokenCardMobile } from "./HistoryTokenCardMobile";

export interface IHistoryTokenGridProps {
  isMobileMedia: boolean;
  historyRowsData: IHistoryTokenGridRowProps[];
}

interface IHistoryTokenGridState {
  historyRowsData: IHistoryTokenGridRowProps[];
}

export class HistoryTokenGrid extends Component<IHistoryTokenGridProps, IHistoryTokenGridState> {
  constructor(props: IHistoryTokenGridProps) {
    super(props);
    this.state = {
      historyRowsData: [],
    };
  }

  public render() {
    return !this.props.isMobileMedia ? this.renderDesktop() : this.renderMobile();
  }

  private renderDesktop = () => {
    const historyRows = this.props.historyRowsData.map(e => <HistoryTokenGridRow key={`${e.currentKey.toString()}`} {...e} />);
    if (historyRows.length === 0) return null;

    return (
      <div className="history-token-grid">
        <HistoryTokenGridHeader />
        {historyRows}
      </div>
    );
  }

  private renderMobile = () => {
    const historyRows = this.props.historyRowsData.map(e => <HistoryTokenCardMobile key={`${e.currentKey.toString()}`} {...e} />);
    if (historyRows.length === 0) return null;

    return (
      <div className="history-token-cards">
        {historyRows}
      </div>
    );
  }
}