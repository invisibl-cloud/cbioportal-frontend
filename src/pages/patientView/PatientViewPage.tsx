import * as React from 'react';
import * as _ from 'lodash';
import $ from 'jquery';
import { default as ReactBootstrap} from 'react-bootstrap';
import GenomicOverview from './genomicOverview/GenomicOverview';
import { ClinicalData } from "shared/api/generated/CBioPortalAPI";
import { ClinicalDataBySampleId } from "../../shared/api/api-types-extended";
import { RequestStatus } from "../../shared/api/api-types-extended";
import FeatureTitle from '../../shared/components/featureTitle/FeatureTitle';
import {If, Then, Else} from 'react-if';
import SampleManager from './sampleManager';
import SelectCallback = ReactBootstrap.SelectCallback;
import Spinner from 'react-spinkit';
import { Modal } from 'react-bootstrap';
import PatientHeader from './patientHeader/PatientHeader';
import {PaginationControls} from "../../shared/components/paginationControls/PaginationControls";
import { PatientViewPageStore } from './clinicalInformation/PatientViewPageStore';
import ClinicalInformationPatientTable from "./clinicalInformation/ClinicalInformationPatientTable";
import ClinicalInformationSamples from "./clinicalInformation/ClinicalInformationSamplesTable";
import {observer, inject } from "mobx-react";
import {getSpans} from './clinicalInformation/lib/clinicalAttributesUtil.js';
import CopyNumberTableWrapper from "./copyNumberAlterations/CopyNumberTableWrapper";
import {reaction, computed} from "mobx";
import Timeline from "./timeline/Timeline";
import {default as PatientViewMutationTable, MutationTableColumnType} from "./mutation/PatientViewMutationTable";
import PathologyReport from "./pathologyReport/PathologyReport";
import { MSKTabs, MSKTab } from "../../shared/components/MSKTabs/MSKTabs";
import validateParameters from '../../shared/lib/validateParameters';

import './patient.scss';

const patientViewPageStore = new PatientViewPageStore();

(window as any).patientViewPageStore = patientViewPageStore;

export interface IPatientViewPageProps {
    routing: any;
    samples?: ClinicalDataBySampleId[];
    loadClinicalInformationTableData?: () => Promise<any>;
    patient?: {
        id: string,
        clinicalData: ClinicalData[]
    };
    clinicalDataStatus?: RequestStatus;
}

@inject('routing')
@observer
export default class PatientViewPage extends React.Component<IPatientViewPageProps, {}> {

    private mutationTableColumns: MutationTableColumnType[];

    constructor(props: IPatientViewPageProps) {

        super();

        //TODO: this should be done by a module so that it can be reused on other pages

        const reaction1 = reaction(
            () => props.routing.location.query,
            query => {

                const validationResult = validateParameters(query, [ 'studyId', ['sampleId', 'caseId']]);

                if (validationResult.isValid) {

                    patientViewPageStore.urlValidationError = null;

                    if ('studyId' in query) {
                        patientViewPageStore.studyId = query.studyId;
                    }
                    if ('caseId' in query) {
                        patientViewPageStore.setPatientId(query.caseId as string);
                    } else if ('sampleId' in query)
                    {
                        patientViewPageStore.setSampleId(query.sampleId as string);
                    }
                    patientViewPageStore.patientIdsInCohort = ('navCaseIds' in query ? (query.navCaseIds as string).split(",") : []);

                } else {
                    patientViewPageStore.urlValidationError = validationResult.message;
                }

            },
            { fireImmediately:true }
        );

        this.mutationTableColumns = [MutationTableColumnType.COHORT,
            MutationTableColumnType.MRNA_EXPR,
            MutationTableColumnType.COPY_NUM,
            MutationTableColumnType.ANNOTATION,
            MutationTableColumnType.REF_READS_N,
            MutationTableColumnType.VAR_READS_N,
            MutationTableColumnType.REF_READS,
            MutationTableColumnType.VAR_READS,
            MutationTableColumnType.START_POS,
            MutationTableColumnType.END_POS,
            MutationTableColumnType.REF_ALLELE,
            MutationTableColumnType.VAR_ALLELE,
            MutationTableColumnType.MUTATION_STATUS,
            MutationTableColumnType.VALIDATION_STATUS,
            MutationTableColumnType.CENTER,
            MutationTableColumnType.GENE,
            MutationTableColumnType.CHROMOSOME,
            MutationTableColumnType.PROTEIN_CHANGE,
            MutationTableColumnType.MUTATION_TYPE,
            MutationTableColumnType.MUTATION_ASSESSOR,
            MutationTableColumnType.COSMIC,
            MutationTableColumnType.TUMOR_ALLELE_FREQ,
            MutationTableColumnType.TUMORS];
    }

    public componentDidMount() {

        this.exposeComponentRenderersToParentScript();

    }

    // this gives the parent (legacy) cbioportal code control to mount
    // these components whenever and wherever it wants
    exposeComponentRenderersToParentScript() {

        // exposeComponentRenderer('renderClinicalInformationContainer', ClinicalInformationContainer,
        //     { store:this.props.store }
        // );
        //
        // exposeComponentRenderer('renderGenomicOverview', GenomicOverview);

    }

    private handleSampleClick(id: string) {

        this.props.routing.updateRoute({ caseId:undefined, sampleId:id });

    }

    private handleTabChange(id: string) {

        this.props.routing.updateRoute({ tab: id });

    }

    private handlePatientClick(id: string) {

        this.props.routing.updateRoute({ caseId: id, sampleId: undefined });

    }

    @computed get cnaTableStatus() {
        if (patientViewPageStore.geneticProfileIdDiscrete.isComplete) {
            if (patientViewPageStore.geneticProfileIdDiscrete.result === undefined) {
                return "unavailable";
            } else if (patientViewPageStore.discreteCNAData.isComplete) {
                return "available";
            } else {
                return "loading";
            }
        } else {
            return "loading";
        }
    }

    public render() {

        let sampleManager: SampleManager | null = null;
        let sampleHeader: (JSX.Element | undefined)[] | null = null;
        let cohortNav: JSX.Element | null = null;
        let studyName: JSX.Element | null = null;

        if (patientViewPageStore.urlValidationError) {
            return (
                <div className="alert alert-danger urlError" role="alert">
                    <i className="fa fa-warning" aria-hidden="true"></i>
                    <h3>The URL is invalid</h3>
                    <ul>
                        { patientViewPageStore.urlValidationError
                            .split(".").map((message:string)=>(message.length > 0) ? <li>{message}</li> : null)
                        }
                    </ul>
                </div>
            )
        }

        if (patientViewPageStore.studyMetaData.isComplete) {
            let study = patientViewPageStore.studyMetaData.result;
            studyName = <a href={`study.do?cancer_study_id=${study.studyId}`} className="studyMetaBar_studyName">{study.name}</a>;
        }

        if (patientViewPageStore.patientViewData.isComplete) {
            let patientData = patientViewPageStore.patientViewData.result!;
            if (patientViewPageStore.clinicalEvents.isComplete && patientViewPageStore.clinicalEvents.result.length > 0) {
                sampleManager = new SampleManager(patientData.samples!, patientViewPageStore.clinicalEvents.result);
            } else {
                sampleManager = new SampleManager(patientData.samples!);
            }

            sampleHeader = _.map(sampleManager!.samples, (sample: ClinicalDataBySampleId) => {
                const clinicalDataLegacy: any = _.fromPairs(sample.clinicalData.map((x) => [x.clinicalAttributeId, x.value]));
                return (
                    <div className="patientSample">
                        {  sampleManager!.getComponentForSample(sample.id, true) }
                        {'\u00A0'}
                        <a href="javascript:void(0)" onClick={()=>{ this.handleSampleClick(sample.id) }}>{sample.id}</a>
                        <span className='clinical-spans'
                              dangerouslySetInnerHTML={{__html:getSpans(clinicalDataLegacy, 'lgg_ucsf_2014')}}></span>
                    </div>

                )
            });


        }

        if (patientViewPageStore.patientIdsInCohort && patientViewPageStore.patientIdsInCohort.length > 0) {
            const indexInCohort = patientViewPageStore.patientIdsInCohort.indexOf(patientViewPageStore.patientId);
            cohortNav = (
                <PaginationControls
                    currentPage={indexInCohort + 1}
                    showItemsPerPageSelector={false}
                    showFirstPage={true}
                    showLastPage={true}
                    textBetweenButtons={` of ${patientViewPageStore.patientIdsInCohort.length} patients`}
                    firstPageDisabled={indexInCohort === 0}
                    previousPageDisabled={indexInCohort === 0}
                    nextPageDisabled={indexInCohort === patientViewPageStore.patientIdsInCohort.length-1}
                    lastPageDisabled={indexInCohort === patientViewPageStore.patientIdsInCohort.length-1}
                    onFirstPageClick={() => this.handlePatientClick(patientViewPageStore.patientIdsInCohort[0]) }
                    onPreviousPageClick={() => this.handlePatientClick(patientViewPageStore.patientIdsInCohort[indexInCohort-1]) }
                    onNextPageClick={() => this.handlePatientClick(patientViewPageStore.patientIdsInCohort[indexInCohort+1]) }
                    onLastPageClick={() => this.handlePatientClick(patientViewPageStore.patientIdsInCohort[patientViewPageStore.patientIdsInCohort.length-1]) }
                    onChangeCurrentPage={(newPage) => {
                        if (newPage > 0 && newPage <= patientViewPageStore.patientIdsInCohort.length) {
                            this.handlePatientClick(patientViewPageStore.patientIdsInCohort[newPage - 1]);
                        }
                    }}
                    pageNumberEditable={true}
                    className="cohortNav"
                />
            );
        }

        return (
            <div className="patientViewPage">

                <Modal show={(patientViewPageStore.ajaxErrors.length > 0)} onHide={()=>{ patientViewPageStore.clearErrors() }}>
                    <Modal.Header closeButton>
                        <Modal.Title>Sorry, something went wrong!</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Troubleshooting:</p>
                        <ul>
                            <li>Check that your URL parameters are valid.</li>
                            <li>Make sure you are connected to the internet.</li>
                        </ul>
                    </Modal.Body>
                </Modal>

                <div className="topBanner">

                {  (patientViewPageStore.patientViewData.isComplete) && (
                    <div className="patientPageHeader">
                        <i className="fa fa-user-circle-o patientIcon" aria-hidden="true"></i>
                        <div className="patientDataTable">
                        <table>
                            <tr>
                                <td>Patient:</td>
                                <td><PatientHeader
                                    handlePatientClick={(id: string)=>this.handlePatientClick(id)}
                                    patient={patientViewPageStore.patientViewData.result.patient}
                                    darwinUrl={patientViewPageStore.darwinUrl.result}/></td>
                            </tr>
                            <tr>
                                <td>Samples:</td>
                                <td>
                                    <div className="patientSamples">{sampleHeader}</div>
                                </td>
                            </tr>
                        </table>
                        </div>
                        <div className="studyMetaBar">{ studyName } <If condition={(cohortNav != null)}>{cohortNav}</If></div>
                    </div>
                )
                }
                </div>
                <If condition={patientViewPageStore.patientViewData.isComplete}>
                <Then>
                <MSKTabs id="patientViewPageTabs" activeTabId={this.props.routing.location.query.tab}  onTabClick={(id:string)=>this.handleTabChange(id)} className="mainTabs">

                        <MSKTab key={0} id="summaryTab" linkText="Summary">

                            {
                                (!!sampleManager && patientViewPageStore.clinicalEvents.isComplete && patientViewPageStore.clinicalEvents.result.length > 0) && (

                                    <div>
                                        <Timeline store={patientViewPageStore} getWidth={ ()=>$(window).width()-40 } sampleManager={ sampleManager } />
                                        <hr />
                                    </div>
                                )

                            }

                            {
                                (patientViewPageStore.mutationData.isComplete && patientViewPageStore.cnaSegments.isComplete && sampleManager) && (
                                    <GenomicOverview
                                        mutations={patientViewPageStore.mutationData.result}
                                        cnaSegments={patientViewPageStore.cnaSegments.result}
                                        sampleOrder={sampleManager.sampleIndex}
                                        sampleLabels={sampleManager.sampleLabels}
                                        sampleColors={sampleManager.sampleColors}
                                        sampleManager={sampleManager}
                                        getContainerWidth={()=>$(window).width()}
                                    />
                                )
                            }

                            <hr />

                            {
                                (patientViewPageStore.mutationData.isComplete && !!sampleManager) && (
                                    <PatientViewMutationTable
                                        sampleManager={sampleManager}
                                        sampleIds={sampleManager ? sampleManager.getSampleIdsInOrder() : []}
                                        variantCountCache={patientViewPageStore.variantCountCache}
                                        discreteCNACache={patientViewPageStore.discreteCNACache}
                                        mrnaExprRankCache={patientViewPageStore.mrnaExprRankCache}
                                        oncoKbEvidenceCache={patientViewPageStore.oncoKbEvidenceCache}
                                        pmidCache={patientViewPageStore.pmidCache}
                                        mrnaExprRankGeneticProfileId={patientViewPageStore.mrnaRankGeneticProfileId.result || undefined}
                                        discreteCNAGeneticProfileId={patientViewPageStore.geneticProfileIdDiscrete.result}
                                        data={patientViewPageStore.mergedMutationData}
                                        mutSigData={patientViewPageStore.mutSigData.result}
                                        myCancerGenomeData={patientViewPageStore.myCancerGenomeData}
                                        hotspots={patientViewPageStore.indexedHotspotData}
                                        cosmicData={patientViewPageStore.cosmicData.result}
                                        oncoKbData={patientViewPageStore.oncoKbData.result}
                                        columns={this.mutationTableColumns}
                                    />
                                )
                            }

                            <hr />

                            <CopyNumberTableWrapper
                                sampleIds={sampleManager ? sampleManager.getSampleIdsInOrder() : []}
                                sampleManager={sampleManager}
                                cnaOncoKbData={patientViewPageStore.cnaOncoKbData.result}
                                oncoKbEvidenceCache={patientViewPageStore.oncoKbEvidenceCache}
                                pmidCache={patientViewPageStore.pmidCache}
                                data={patientViewPageStore.mergedDiscreteCNAData}
                                copyNumberCountData={patientViewPageStore.copyNumberCountData.result}
                                mrnaExprRankCache={patientViewPageStore.mrnaExprRankCache}
                                gisticData={patientViewPageStore.gisticData.result}
                                status={this.cnaTableStatus}
                            />
                        </MSKTab>

                        {(patientViewPageStore.pageMode === 'patient') && (
                        <MSKTab key={2} id="clinicalDataTab" linkText="Clinical Data">

                                    <div className="clearfix">
                                        <FeatureTitle title="Patient"
                                                      isLoading={ patientViewPageStore.clinicalDataPatient.isPending }
                                                      className="pull-left"/>
                                        { (patientViewPageStore.clinicalDataPatient.isComplete) && (
                                            <ClinicalInformationPatientTable showTitleBar={true}
                                                                             data={patientViewPageStore.clinicalDataPatient.result}/>

                                        )
                                        }
                                    </div>

                            <br />

                            <div className="clearfix">
                                <FeatureTitle title="Samples" isLoading={ patientViewPageStore.clinicalDataGroupedBySample.isPending } className="pull-left" />
                                {  (patientViewPageStore.clinicalDataGroupedBySample.isComplete) && (
                                    <ClinicalInformationSamples
                                        samples={patientViewPageStore.clinicalDataGroupedBySample.result!}/>
                                )
                                }
                            </div>


                        </MSKTab>
                    )}


                    <MSKTab key={3} id="pathologyReportTab" linkText="Pathology Report"
                            hide={(patientViewPageStore.pathologyReport.isComplete && patientViewPageStore.pathologyReport.result.length === 0)}
                            loading={patientViewPageStore.pathologyReport.isPending}
                    >
                        <PathologyReport pdfs={patientViewPageStore.pathologyReport.result} />
                    </MSKTab>


                    <MSKTab key={4} id="heatMapReportTab" linkText="Heatmap"
                             hide={(patientViewPageStore.MDAndersonHeatMapAvailable.isComplete && !patientViewPageStore.MDAndersonHeatMapAvailable.result)}
                            loading={patientViewPageStore.MDAndersonHeatMapAvailable.isPending}
                    >
                        <iframe style={{width:'100%', height:700, border:'none'}}
                                src={ `//bioinformatics.mdanderson.org/TCGA/NGCHMPortal/?participant=${patientViewPageStore.patientId}` }></iframe>
                    </MSKTab>

                    <MSKTab key={5} id="tissueImageTab" linkText="Tissue Image"
                            hide={(patientViewPageStore.hasTissueImageIFrameUrl.isComplete && !patientViewPageStore.hasTissueImageIFrameUrl.result)}
                            loading={patientViewPageStore.hasTissueImageIFrameUrl.isPending}
                    >
                        <iframe style={{width:'100%', height:700, border:'none'}}
                                src={ `http://cancer.digitalslidearchive.net/index_mskcc.php?slide_name=${patientViewPageStore.patientId}` }></iframe>
                    </MSKTab>

                    </MSKTabs>

                    </Then>
                    <Else>
                        <Spinner style={{textAlign:'center'}} spinnerName="three-bounce" noFadeIn/>
                    </Else>

                </If>

            </div>
        );
    }
}
