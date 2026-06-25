import { Modal } from "react-bootstrap";

export function HelpModal(props: {
	showHelpModal: boolean;
	setShowHelpModal: (value: boolean) => void;
}) {
	const { showHelpModal, setShowHelpModal } = props;
	return (
		<Modal
			size="lg"
			show={showHelpModal}
			onHide={() => setShowHelpModal(false)}
			ariaLabelledBy="pulsar-help-modal"
		>
			<Modal.Header closeButton id="pulsar-help-modal" className="fw-bold fs-5">
				Help
			</Modal.Header>
			<Modal.Body>TODO</Modal.Body>{" "}
			{/* TODO: Add help information – basic instructions, keyboard shortcuts */}
		</Modal>
	);
}

export function AboutModal(props: {
	showAboutModal: boolean;
	setShowAboutModal: (value: boolean) => void;
}) {
	const { showAboutModal, setShowAboutModal } = props;
	return (
		<Modal
			size="lg"
			show={showAboutModal}
			onHide={() => setShowAboutModal(false)}
			ariaLabelledBy="pulsar-about-modal"
		>
			<Modal.Header
				closeButton
				id="pulsar-about-modal"
				className="fw-bold fs-5"
			>
				About
			</Modal.Header>
			<Modal.Body>
				<p>
					Foothill AstroSims pulsar beam intensity simulator (v0.1.0) <br />
					<br />
					Built by Steven Yuan, with assistance from Dr. Baba Kofi Weusijana and
					Dr. Geoff Mathews <br />
					For Foothill College CS 77B, Projects in Web App Development, Spring
					2026 <br />
					<a href="https://github.com/FoothillAstroSims/pulsar-simulator">
						Link to GitHub repo
					</a>
				</p>
			</Modal.Body>
		</Modal>
	);
}
