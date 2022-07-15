import { Address, Contract, GetExpectedAddressParams, ProviderRpcClient } from "everscale-inpage-provider";
import { ConstructorParams, ContractWithName, DeployTransaction, Optional } from "../types";
import { Giver } from "./giver";
import { AccountFactory } from "./account";
export { Account } from "./account";
export * from "./giver";
export * from "./deployer";
export declare type ContractData<Abi> = {
    code: string;
    tvc: string;
    abi: Abi;
    codeHash: string;
};
export declare type FactoryType = Record<string, any>;
export declare type DeployContractParams<T extends FactoryType, ContractName extends keyof T> = {
    contract: ContractName;
    constructorParams: ConstructorParams<T[ContractName]>;
    value: string;
} & Optional<GetExpectedAddressParams<T[ContractName]>, "tvc">;
export declare class Factory<T extends FactoryType> {
    private readonly ever;
    private readonly giver;
    private readonly factoryCache;
    private constructor();
    static setup<T extends FactoryType>(ever: ProviderRpcClient, giver: Giver): Promise<Factory<T>>;
    private get deployer();
    deployContract<ContractName extends keyof T>(args: DeployContractParams<T, ContractName>): Promise<{
        contract: Contract<T[ContractName]>;
    } & DeployTransaction>;
    getAccountsFactory<ContractName extends keyof T>(contractName: ContractName): AccountFactory<T[ContractName]>;
    getDeployedContract: <ContractName extends keyof T>(name: ContractName, address: Address) => Contract<T[ContractName]>;
    initializeContract: <key extends keyof T>(name: keyof T, resolvedPath: string) => Promise<ContractData<T[key]>>;
    getContractArtifacts<key extends keyof T>(name: key): ContractData<T[key]>;
    getAllArtifacts(): Array<{
        contractName: keyof T;
        artifacts: ContractData<T[keyof T]>;
    }>;
    getContractByCodeHash: (codeHash: string, address: Address) => ContractWithName | undefined;
    private getContractsArtifacts;
}