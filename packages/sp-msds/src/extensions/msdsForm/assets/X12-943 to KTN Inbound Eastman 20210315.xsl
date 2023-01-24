<?xml version="1.0" encoding="utf-8" ?> 
 <xsl:stylesheet version="1.0" xmlns:cidx="urn:cidx:names:specification:ces:schema:all:4:0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:ns0="http://schemas.microsoft.com/BizTalk/EDI/X12/2006">
  <xsl:output method="xml" version="1.0" encoding="utf-8" indent="yes" />
  <xsl:variable name="vAllowedSymbols"
        select="'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'"/>
  <!--Version 1: 20210202-->
	<xsl:template match="/">
		<Orders>
			<Header>
				<MessageFrom>
					<xsl:value-of select="normalize-space(substring-before(substring-after(substring-after(substring-after(substring-after(substring-after(substring-after(//ST/ST02,'*'),'*'),'*'),'*'),'*'),'*'),'*'))"/>
				</MessageFrom>
				<MessageTo>
					<xsl:choose>
						<xsl:when test="//ns0:N1Loop1[./ns0:N1/N101='ST']/ns0:N1/N104='897824' or //ns0:N1Loop1[./ns0:N1/N101='ST']/ns0:N1/N104='897821' or //ns0:N1Loop1[./ns0:N1/N101='ST']/ns0:N1/N104='897819'">
							<xsl:value-of select="'KBT'"/>
						</xsl:when>
						<xsl:when test="//ns0:N1Loop1[./ns0:N1/N101='ST']/ns0:N1/N104='897828' or //ns0:N1Loop1[./ns0:N1/N101='ST']/ns0:N1/N104='897826' or //ns0:N1Loop1[./ns0:N1/N101='ST']/ns0:N1/N104='897801' or //ns0:N1Loop1[./ns0:N1/N101='ST']/ns0:N1/N104='897800'">
							<xsl:value-of select="'LIS'"/>
						</xsl:when>
						<xsl:when test="//ns0:N1Loop1[./ns0:N1/N101='ST']/ns0:N1/N104='897829' or //ns0:N1Loop1[./ns0:N1/N101='ST']/ns0:N1/N104='897823' or //ns0:N1Loop1[./ns0:N1/N101='ST']/ns0:N1/N104='897820' or //ns0:N1Loop1[./ns0:N1/N101='ST']/ns0:N1/N104='897818' or //ns0:N1Loop1[./ns0:N1/N101='ST']/ns0:N1/N104='897804' or //ns0:N1Loop1[./ns0:N1/N101='ST']/ns0:N1/N104='897803'">
							<xsl:value-of select="'CHT'"/>
						</xsl:when>
						<xsl:when test="string-length(//ns0:N1Loop1[./ns0:N1/N101='ST']/ns0:N1/N104) &lt; 1">
							<xsl:value-of select="'Ship To not in message'"/>
						</xsl:when>						
						<xsl:otherwise>
							<xsl:value-of select="'Ship To not set up'"/>
						</xsl:otherwise>
					</xsl:choose>
				</MessageTo>
				<MessageType>
					<xsl:value-of select="//ST/ST01"/>
				</MessageType>
				<MessageId>
					<xsl:value-of select="normalize-space(substring-before(substring-after(substring-after(substring-after(substring-after(substring-after(substring-after(substring-after(substring-after(substring-after(substring-after(substring-after(substring-after(substring-after(//ST/ST02,'*'),'*'),'*'),'*'),'*'),'*'),'*'),'*'),'*'),'*'),'*'),'*'),'*'),'*'))"/>
				</MessageId>
				<MessageDate>
					<xsl:value-of select="normalize-space(substring-before(substring-after(substring-after(substring-after(substring-after(substring-after(substring-after(substring-after(substring-after(substring-after(//ST/ST02,'*'),'*'),'*'),'*'),'*'),'*'),'*'),'*'),'*'),'*'))"/>
				</MessageDate>
				<MessageTime>
					<xsl:value-of select="normalize-space(substring-before(substring-after(substring-after(substring-after(substring-after(substring-after(substring-after(substring-after(substring-after(substring-after(substring-after(//ST/ST02,'*'),'*'),'*'),'*'),'*'),'*'),'*'),'*'),'*'),'*'),'*'))"/>
				</MessageTime>
				<MessageAction>
					<xsl:value-of select="//ns0:BSN/BSN01"/>
				</MessageAction>
			</Header>
			<Order>
				<Error>
				</Error>
				<OrderReferences>
					<OrderType>
						<xsl:text>Inbound943</xsl:text>
					</OrderType>
					<Customer>
						<xsl:call-template name="RemoveLeadingZeros">
							<xsl:with-param name="text" select="//ns0:N1Loop1[./ns0:N1/N101='ST']/ns0:N1/N104"/>
						</xsl:call-template>
					</Customer>
					<PONumber/>
					<Ref1>
						<xsl:choose>
							<xsl:when test="string-length(//ns0:W06/W0606)>1">
								<xsl:value-of select="//ns0:W06/W0606"/>
							</xsl:when>
							<xsl:otherwise>
								<xsl:call-template name="RemoveLeadingZeros">
									<xsl:with-param name="text" select="//ns0:W06/W0602"/>
								</xsl:call-template>
							</xsl:otherwise>
						</xsl:choose>
					</Ref1>
					<Ref2>
						<xsl:call-template name="RemoveLeadingZeros">
							<xsl:with-param name="text" select="//ns0:W06/W0602"/>
						</xsl:call-template>
					</Ref2>
					<Ref3>
						<xsl:value-of select="'Not complete'"/>
					</Ref3>
					<Ref4/>
					<Ref5/>
					<Contact>
					</Contact>
				</OrderReferences>
				<Transports>
					<Transport>
						<Type>
						</Type>
						<TransportLevel/>
						<Kind>
							<xsl:value-of select="'Truck'"/>
						</Kind>
						<Activity>
							<xsl:value-of select="'Truck'"/>
						</Activity>
						<Site>
							<xsl:value-of select="//ns0:N1Loop1[./ns0:N1/N101='ST']/ns0:N1/N104"/>
						</Site>
						<ShippingLine>
						</ShippingLine>
						<Agent>
						</Agent>
						<Vessel>
						</Vessel>
						<VoyageNo>
						</VoyageNo>
						<BL>
						</BL>
						<PortOfLoading/>
						<DeliveryRef/>
						<DeliveryETADate>
							<xsl:value-of select="//ns0:DTM[./DTM01='002']/DTM02"/>
						</DeliveryETADate>
						<DeliveryETATime/>
						<DeliveryLTADate>
							<xsl:value-of select="//ns0:DTM[./DTM01='002']/DTM02"/>
						</DeliveryLTADate>
						<DeliveryLTATime/>
						<PortOfDelivery/>
						<LoadingRef/>
						<LoadingETADate/>
						<LoadingETATime/>
						<LoadingLTADate/>
						<LoadingLTATime/>
						<ClosingDate/>
						<ClosingTime/>
						<LoadingPlace>
							<Identifier>
								<xsl:value-of select="//ns0:N1Loop1[./ns0:N1/N101='SH']/ns0:N1/N104"/>
							</Identifier>
							<Name>
								<xsl:value-of select="//ns0:N1Loop1[./ns0:N1/N101='SH']/ns0:N1/N102"/>
							</Name>
							<Address1>
								<xsl:value-of select="//ns0:N1Loop1[./ns0:N1/N101='SH']/ns0:N2/N201"/>
							</Address1>
							<Address2>
								<xsl:value-of select="//ns0:N1Loop1[./ns0:N1/N101='SH']/ns0:N2/N202"/>
							</Address2>
							<Address3>
								<xsl:value-of select="//ns0:N1Loop1[./ns0:N1/N101='SH']/ns0:N3/N301"/>
							</Address3>
							<Country>
								<xsl:value-of select="//ns0:N1Loop1[./ns0:N1/N101='SH']/ns0:N4/N404"/>
							</Country>
							<ZIP>
								<xsl:value-of select="//ns0:N1Loop1[./ns0:N1/N101='SH']/ns0:N4/N403"/>
							</ZIP>
							<City>
								<xsl:value-of select="//ns0:N1Loop1[./ns0:N1/N101='SH']/N4/N401"/>
							</City>
						</LoadingPlace>
						<DeliveryRef/>
						<ExtraInfo1>
						</ExtraInfo1>
						<DeliveryPlace>
							<Identifier>
								<xsl:value-of select="//ns0:N1Loop1[./ns0:N1/N101='ST']/ns0:N1/N104"/>
							</Identifier>
							<Name>
								<xsl:value-of select="//ns0:N1Loop1[./ns0:N1/N101='ST']/ns0:N1/N102"/>
							</Name>
							<Address1>
								<xsl:value-of select="//ns0:N1Loop1[./ns0:N1/N101='ST']/ns0:N2/N201"/>
							</Address1>
							<Address2>
								<xsl:value-of select="//ns0:N1Loop1[./ns0:N1/N101='ST']/ns0:N2/N202"/>
							</Address2>
							<Address3>
								<xsl:value-of select="//ns0:N1Loop1[./ns0:N1/N101='ST']/ns0:N3/N301"/>
							</Address3>
							<Country>
								<xsl:value-of select="//ns0:N1Loop1[./ns0:N1/N101='ST']/ns0:N4/N404"/>
							</Country>
							<ZIP>
								<xsl:value-of select="//ns0:N1Loop1[./ns0:N1/N101='ST']/ns0:N4/N403"/>
							</ZIP>
							<City>
								<xsl:value-of select="//ns0:N1Loop1[./ns0:N1/N101='ST']/ns0:N4/N401"/>
							</City>
						</DeliveryPlace>
						<!--
						<SoldTo>
							<Identifier>
								<xsl:text>TSRC</xsl:text>
								<xsl:value-of select="//E1EDL20/E1ADRM1[./PARTNER_Q = 'AG']/PARTNER_ID"/>
							</Identifier>
							<Name>
								<xsl:value-of select="//E1EDL20/E1ADRM1[./PARTNER_Q = 'AG']/NAME1"/>
							</Name>
							<Address1>
								<xsl:value-of select="//E1EDL20/E1ADRM1[./PARTNER_Q = 'AG']/STREET1"/>
							</Address1>
							<Address2>
								<xsl:value-of select="//E1EDL20/E1ADRM1[./PARTNER_Q = 'AG']/STREET2"/>
							</Address2>
							<Address3>
								<xsl:value-of select="//E1EDL20/E1ADRM1[./PARTNER_Q = 'AG']/STREET3"/>
							</Address3>
							<Country>
								<xsl:value-of select="//E1EDL20/E1ADRM1[./PARTNER_Q = 'AG']/COUNTRY1"/>
							</Country>
							<ZIP>
								<xsl:value-of select="//E1EDL20/E1ADRM1[./PARTNER_Q = 'AG']/POSTL_COD1"/>
							</ZIP>
							<City>
								<xsl:value-of select="//E1EDL20/E1ADRM1[./PARTNER_Q = 'AG']/CITY1"/>
							</City>
							<VATNumber>
								<xsl:value-of select="//E1EDL20/E1ADRM1[./PARTNER_Q = 'AG']/CITY2"/>
							</VATNumber>
						</SoldTo>-->
						<ProductionSite>
						</ProductionSite>
						<Origin>
							<xsl:value-of select="//ns0:N1Loop1[./ns0:N1/N101='SH']/ns0:N4/N404"/>
						</Origin>
						<Provenance>
							<xsl:value-of select="//ns0:N1Loop1[./ns0:N1/N101='SH']/ns0:N4/N404"/>
						</Provenance>
						<Carrier>
							<xsl:value-of select="'NA'"/>
						</Carrier>
						<Container>
						</Container>
						<Seals>
						</Seals>
						<Incoterms>
							<xsl:value-of select="//ns0:N9[./N901='TC']/N902"/>
						</Incoterms>
						<IncotermsPlace>
							<xsl:value-of select="//ns0:N9[./N901='TC']/N903"/>
						</IncotermsPlace>
						<CustomsDoc/>
						<PurchaseDoc>
							<VATNumber/>
							<Date/>
							<DocNumber/>
							<Amount/>
							<Currency/>
							<GrossWeight/>
						</PurchaseDoc>
						<SalesDoc>
							<VATNumber/>
							<Date/>
							<DocNumber/>
							<Amount/>
							<Currency/>
							<GrossWeight/>
						</SalesDoc>
						<RemarksOperations>
							<Remark/>
						</RemarksOperations>
						<RemarksChecklist>
							<Remark/>
						</RemarksChecklist>
						<RemarksFrontpage>
							<Remark/>
						</RemarksFrontpage>
						<RemarksTransport>
							<Remark/>
						</RemarksTransport>
						<RemarksDriversDoc>
							<Remark/>
						</RemarksDriversDoc>
						<RemarksPicking>
							<Remark/>
						</RemarksPicking>
						<Product>
							<Article>
								<xsl:for-each select="//ns0:W04Loop1[1]">
									<xsl:value-of select="./ns0:W04/W0405"/>
								</xsl:for-each>
							</Article>
						</Product>
						<Stock>
							<xsl:for-each select="//ns0:W04Loop1">
								<StockLine>
									<LineNo/>
									<SubLineNo/>
									<Article>
										<xsl:value-of select="./ns0:W04/W0405"/>
									</Article>
									<Batch/>
									<Batch2>
									</Batch2>
									<ClientRef>
									</ClientRef>
									<ClientRef2/>
									<ProductionDate>
									</ProductionDate>
									<ExpiryDate>
									</ExpiryDate>
									<PONumber>
									</PONumber>
									<Origin>
									</Origin>
									<ExtraRef1/>
									<ExtraRef2/>
									<ExtraRef3/>
									<ExtraRef4/>
									<ExtraRef5/>
									<ExtraRef6/>
									<ExtraRef7/>
									<ExtraRef8/>
									<DescriptionDriversDoc/>
									<NetWeight>	
										<xsl:value-of select="./ns0:W20[./W2005='N']/W2004"/>
									</NetWeight>
									<WeightUnit>
										<xsl:value-of select="./ns0:W20[./W2005='N']/W2003"/>						
									</WeightUnit>
									<Qty>
										<xsl:value-of select="./ns0:W04/W0401"/>
									</Qty>
									<QtyUnit>
										<xsl:value-of select="./ns0:W04/W0402"/>
									</QtyUnit>
									<Origin/>
								</StockLine>
							</xsl:for-each>
						</Stock>
					</Transport>
				</Transports>
			</Order>
		</Orders>
  </xsl:template>
  
  <xsl:template name="RemoveLeadingZeros">
    <xsl:param name="text"/>
    <xsl:choose>
        <xsl:when test="starts-with($text,'0')">
            <xsl:call-template name="RemoveLeadingZeros">
                <xsl:with-param name="text"
                    select="substring-after($text,'0')"/>
            </xsl:call-template>
        </xsl:when>
        <xsl:otherwise>
            <xsl:value-of select="$text"/>
        </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  
  <xsl:template name="SkipAllNonLettersOrNumbers">
    <xsl:param name="text"/>        
    <xsl:value-of select="translate($text,translate($text, $vAllowedSymbols, ''),'')"/>
  </xsl:template>

  </xsl:stylesheet>
