type TemplateProps = {
  initParams: string;
  constructorParams?: string;
}

export function contractDeployMethodTemplate({
  initParams,
  constructorParams,
}: TemplateProps): string {
  const template =
`  public async deploy({
    keyPair,
    initParams,${!!constructorParams ? '\n    constructorParams,' : ''}
  }: {
    keyPair?: KeyPair;
    initParams: {${initParams}};${!!constructorParams ? `\n    constructorParams: {${constructorParams}};` : ''}
  }) {
    return await this.locklift.giver.deployContract<${!!constructorParams ? `{${constructorParams}}` : 'undefined'}, {${initParams}}>({
      contract: this,
      keyPair: keyPair || this.keyPair!,
      initParams,${!!constructorParams ? '\n      constructorParams,' : ''}
    });
  }`

  return template;
}