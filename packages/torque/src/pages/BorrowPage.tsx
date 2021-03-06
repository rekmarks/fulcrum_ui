import React, { PureComponent, RefObject } from "react";
import { RouteComponentProps } from "react-router";
import { AssetSelector } from "../components/AssetSelector";
import { BorrowDlg } from "../components/BorrowDlg";
import { Asset } from "../domain/Asset";
import { WalletType, walletTypeAbbrToWalletType } from "../domain/WalletType";
import { Footer } from "../layout/Footer";
import { HeaderOps } from "../layout/HeaderOps";
import { NavService } from "../services/NavService";
import { TorqueProvider } from "../services/TorqueProvider";

export interface IBorrowPageRouteParams {
  walletTypeAbbr: string;
}

export interface IBorrowPageParams {
  doNetworkConnect?: (destinationAbbr: string) => void;
  isRiskDisclosureModalOpen: ()  => void;
  isLoading: boolean;
}

export class BorrowPage extends PureComponent<IBorrowPageParams & RouteComponentProps<IBorrowPageRouteParams>> {
  private borrowDlgRef: RefObject<BorrowDlg>;

  public constructor(props: any, context?: any) {
    super(props, context);

    this.borrowDlgRef = React.createRef();
  }

  public render() {
    const walletType = walletTypeAbbrToWalletType(this.props.match.params.walletTypeAbbr);

    return (
      <React.Fragment>
        <BorrowDlg ref={this.borrowDlgRef} />
        <div className="borrow-page">
          <HeaderOps isLoading={this.props.isLoading} doNetworkConnect={this.doNetworkConnect} isRiskDisclosureModalOpen={this.props.isRiskDisclosureModalOpen} />
          {/*<div className="borrow-page__main" style={walletType === WalletType.Web3 ? { paddingBottom: `90rem`} : undefined}>*/}
          <div className="borrow-page__main">
            <AssetSelector walletType={walletType} onSelectAsset={this.onSelectAsset} />
          </div>
          <Footer isRiskDisclosureModalOpen={this.props.isRiskDisclosureModalOpen} />
        </div>
      </React.Fragment>
    );
  }

  private onSelectAsset = async (asset: Asset) => {

    const walletType = walletTypeAbbrToWalletType(this.props.match.params.walletTypeAbbr);

    if (walletType === WalletType.Web3) {
      if (!TorqueProvider.Instance.contractsSource || !TorqueProvider.Instance.contractsSource.canWrite) {
        NavService.Instance.History.replace(NavService.Instance.getWalletAddress("b"));
        return;
      }
    }

    if (this.borrowDlgRef.current) {
      try {
        const borrowRequest = await this.borrowDlgRef.current.getValue(walletType, asset);

        if (borrowRequest.walletType === WalletType.NonWeb3) {
          NavService.Instance.History.replace(NavService.Instance.getDashboardAddress(walletType, ""));
        } else if (borrowRequest.walletType === WalletType.Web3) {
          const accountAddress =
            TorqueProvider.Instance.accounts.length > 0 && TorqueProvider.Instance.accounts[0]
              ? TorqueProvider.Instance.accounts[0].toLowerCase()
              : null;

          if (!accountAddress || !TorqueProvider.Instance.contractsSource || !TorqueProvider.Instance.contractsSource.canWrite) {
            NavService.Instance.History.replace(NavService.Instance.getWalletAddress("b"));
            return;
          }

          await TorqueProvider.Instance.doBorrow(borrowRequest);
          NavService.Instance.History.replace(NavService.Instance.getDashboardAddress(walletType, accountAddress));

          this.borrowDlgRef.current.toggleDidSubmit(false);
          await this.borrowDlgRef.current.hide();
        }
      } catch(error) {
        /*let errorMsg;
        if (error.message) {
          errorMsg = error.message;
        } else if (typeof error === "string") {
          errorMsg = error;
        }
  
        if (errorMsg) {
          if (errorMsg.includes(`Request for method "eth_estimateGas" not handled by any subprovider`)) {
            errorMsg = "The transaction seems like it will fail. You can submit the transaction anyway, or cancel.";
          } else if (errorMsg.includes("Reverted by EVM")) {
            errorMsg = "The transaction failed. Click View More for details.";
          } else if (errorMsg.includes("MetaMask Tx Signature: User denied transaction signature.")) {
            errorMsg = "You didn't confirm in MetaMask. Please try again.";
            await this.borrowDlgRef.current.hide();
          } else if (errorMsg.includes("User denied account authorization.")) {
            errorMsg = "You didn't authorize MetaMask. Please try again.";
          } else if (errorMsg.includes("Transaction rejected")) {
            errorMsg = "You didn't confirm in Gnosis Safe. Please try again.";
          } else {
            errorMsg = "";
          }
        }*/
        
        this.borrowDlgRef.current.toggleDidSubmit(false);
        await this.borrowDlgRef.current.hide();
      }
    }
  };

  private doNetworkConnect = () => {
    if (this.props.doNetworkConnect) {
      this.props.doNetworkConnect("b");
    }
  };
}
