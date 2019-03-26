import BigNumber from "bignumber.js";
import React, { ChangeEvent, Component, FormEvent } from "react";
import { Asset } from "../domain/Asset";
import { AssetDetails } from "../domain/AssetDetails";
import { AssetsDictionary } from "../domain/AssetsDictionary";
import { LendRequest } from "../domain/LendRequest";
import FulcrumProvider from "../services/FulcrumProvider";

export interface ILendFormProps {
  asset: Asset;

  onSubmit: (request: LendRequest) => void;
  onCancel: () => void;
}

interface ILendFormState {
  assetDetails: AssetDetails | null;
  interestRate: BigNumber;

  lendAmountText: string;
  lendAmount: BigNumber;

  lendedAmountEstimate: BigNumber;
}

export class LendForm extends Component<ILendFormProps, ILendFormState> {
  private _input: HTMLInputElement | null = null;

  constructor(props: ILendFormProps, context?: any) {
    super(props, context);

    const assetDetails = AssetsDictionary.assets.get(props.asset);
    const interestRate = FulcrumProvider.getTokenInterestRate(props.asset);
    const maxLendValue = FulcrumProvider.getMaxLendValue(props.asset);
    const lendedAmountEstimate = FulcrumProvider.getLendedAmountEstimate(new LendRequest(props.asset, maxLendValue));

    this.state = {
      lendAmountText: maxLendValue.toFixed(),
      lendAmount: maxLendValue,
      lendedAmountEstimate: lendedAmountEstimate,
      assetDetails: assetDetails || null,
      interestRate: interestRate
    };
  }

  private _setInputRef = (input: HTMLInputElement) => {
    this._input = input;
  };

  public componentDidMount(): void {
    if (this._input) {
      this._input.select();
      this._input.focus();
    }
  }

  public render() {
    if (!this.state.assetDetails) {
      return null;
    }

    const divStyle = {
      backgroundImage: `url(${this.state.assetDetails.bgSvg})`
    };

    return (
      <form className="lend-form" onSubmit={this.onSubmitClick}>
        <div className="lend-form__image" style={divStyle}>
          <img src={this.state.assetDetails.logoSvg} alt={this.state.assetDetails.displayName} />
        </div>
        <div className="lend-form__form-container">
          <div className="lend-form__form-values-container">
            <div className="lend-form__kv-container lend-form__kv-container--w_dots">
              <div className="lend-form__label">Token</div>
              <div className="lend-form__value">{this.state.assetDetails.displayName}</div>
            </div>
            <div className="lend-form__kv-container lend-form__kv-container--w_dots">
              <div className="lend-form__label">Interest rate</div>
              <div className="lend-form__value">{`${this.state.interestRate.toFixed()}%`}</div>
            </div>
            <div className="lend-form__kv-container">
              <div className="lend-form__label">Amount</div>
              <div className="lend-form__value">{this.state.assetDetails.displayName}</div>
            </div>
            <input
              type="text"
              ref={this._setInputRef}
              className="lend-form__amount"
              value={this.state.lendAmountText}
              onChange={this.onLendAmountChange}
            />
            <div className="lend-form__kv-container">
              <div className="lend-form__label lend-form__label--action" onClick={this.onInsertMaxValue}>
                Insert max value
              </div>
              <div className="lend-form__value lend-form__value--no-color">
                <span className="rounded-mark">?</span>
                &nbsp; {this.state.lendedAmountEstimate.toFixed(2)} i{this.state.assetDetails.displayName}
              </div>
            </div>
          </div>

          <div className="lend-form__actions-container">
            <button type="submit" className="lend-form__submit-button">
              Lend
            </button>
            <button className="lend-form__cancel-button" onClick={this.onCancelClick}>
              <span className="lend-form__label--action">Cancel</span>
            </button>
          </div>
        </div>
      </form>
    );
  }

  public onLendAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    // handling different types of empty values
    let amountText = event.target.value ? event.target.value : "";
    const amountTextForConversion = amountText === "" ? "0" : amountText;

    let amount = new BigNumber(amountTextForConversion);
    // handling negative values (incl. Ctrl+C)
    if (amount.isNegative()) {
      amountText = amount.absoluteValue().toFixed();
      amount = amount.absoluteValue();
    }

    // updating stored value only if the new input value is a valid number
    const lendedAmountEstimate = FulcrumProvider.getLendedAmountEstimate(new LendRequest(this.props.asset, amount));
    if (!amount.isNaN()) {
      this.setState({
        ...this.state,
        lendAmountText: amountText,
        lendAmount: amount,
        lendedAmountEstimate: lendedAmountEstimate
      });
    }
  };

  public onInsertMaxValue = () => {
    if (!this.state.assetDetails) {
      return null;
    }

    const maxLendValue = FulcrumProvider.getMaxLendValue(this.props.asset);
    const lendedAmountEstimate = FulcrumProvider.getLendedAmountEstimate(
      new LendRequest(this.props.asset, maxLendValue)
    );
    this.setState({
      lendAmountText: maxLendValue.toFixed(),
      lendAmount: maxLendValue,
      lendedAmountEstimate: lendedAmountEstimate
    });
  };

  public onCancelClick = () => {
    this.props.onCancel();
  };

  public onSubmitClick = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (this.state.lendAmount.isZero()) {
      if (this._input) {
        this._input.focus();
      }
      return;
    }

    if (!this.state.assetDetails) {
      this.props.onCancel();
      return;
    }

    if (!this.state.lendAmount.isPositive()) {
      this.props.onCancel();
      return;
    }

    this.props.onSubmit(new LendRequest(this.props.asset, this.state.lendAmount));
  };
}
