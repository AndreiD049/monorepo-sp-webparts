import * as React from 'react';
import styles from './FeedbackForm.module.scss';
import { NavigationBar } from '../../components/NavigationBar';
import { Link } from 'react-router-dom';
import { ICountry, getCountries } from './countries';
import { Dropdown, IDropdownOption, TextField } from 'office-ui-fabric-react';

export interface IFeedbackFormProps {
	// Props go here
}
const RoundImage: React.FC<{
	src: string;
	width: number;
	height: number;
	className?: string;
}> = (props) => {
	const imageRef = React.useRef<HTMLImageElement>(null);
	const containerStyle: React.CSSProperties = {
		borderRadius: '50%',
		width: props.width,
		height: props.height,
		overflow: 'hidden',
	};

	const imageStyle: React.CSSProperties = {
		display: 'block',
		width: '100%',
		height: '100%',
		objectFit: 'cover',
	};

	return (
		<div style={containerStyle} className={props.className}>
			<img ref={imageRef} src={props.src} style={imageStyle} alt="Round image" />
		</div>
	);
};

function calculateLineHeight(container?: HTMLDivElement): void {
	if (!container) return;

	const parent = container.closest(`.${styles.step}`);
	if (!parent) return;

	const nextParent = parent.nextElementSibling as HTMLDivElement;
	if (!nextParent) return;

	const nextImage = nextParent.querySelector(
		`.${styles['step-visualization']}`
	) as HTMLDivElement;
	if (!nextImage) return;

	const thisImageRect = container.getBoundingClientRect();
	const nextImageRect = nextImage.getBoundingClientRect();
	const distance = nextImageRect.top - thisImageRect.bottom;

	const line = container.querySelector(
		`.${styles['step-line']}`
	) as HTMLDivElement;
	line.style.height = `${distance}px`;
}

function animateLine(id: string): void {
	const control = document.getElementById(id) as HTMLDivElement;
	const line = control.querySelector(
		`.${styles['step-line']}`
	) as HTMLDivElement;
	line.classList.add(styles.show);
}

function animateImage(id: string): void {
	const control = document.getElementById(id) as HTMLDivElement;
	if (!control) return;

	const parent = control.closest(`.${styles.step}`);
	if (!parent) return;

	const image = parent.querySelector(`.${styles['step-visualization']} img`) as HTMLImageElement;

	image.classList.add(styles.show);
	setTimeout(() => {
		image.classList.remove(styles.show);
	}, 500);
}

const StepRoundImage: React.FC<{
	src: string;
	width: number;
	height: number;
}> = (props) => {
	const containerStyle: React.CSSProperties = {
		borderRadius: '50%',
		width: props.width * 1.2,
		height: props.height * 1.2,
	};
	const container = React.useRef<HTMLDivElement>(null);

	calculateLineHeight(container.current);

	return (
		<div
			ref={container}
			className={styles['step-visualization']}
			style={containerStyle}
		>
			<RoundImage
				src={props.src}
				width={props.width}
				height={props.height}
				className={styles['center-image']}
			/>
			<div className={styles['step-line']} />
		</div>
	);
};

const Step: React.FC<{
	id?: string;
	control: React.ReactNode;
	imageSrc: string;
}> = (props) => {
	return (
		<div className={styles.step} id={props.id}>
			<div className={styles.control}>{props.control}</div>
			<div className={styles.visualization}>
				<StepRoundImage src={props.imageSrc} width={120} height={120} />
			</div>
		</div>
	);
};

const CountryDropdown: React.FC<{
	countries: ICountry[];
	onChange: (country: ICountry) => void;
}> = (props) => {
	const options = props.countries.map((country) => {
		return {
			key: country.Data.code,
			text: country.Data.name,
			data: country,
		};
	});

	const handleChange = (
		_event: React.FormEvent<HTMLDivElement>,
		option?: IDropdownOption,
	): void => {
		if (!option) return;
		const country = option.data as ICountry;
		props.onChange(country);
		animateLine('country');
		animateImage('country');
	};

	return <Dropdown required label='Country' className={styles['country-dropdown']} placeholder='--Select country--' options={options} onChange={handleChange} />;
};

export const FeedbackForm: React.FC<IFeedbackFormProps> = () => {
	const [country, setCountry] = React.useState<ICountry>(null);
	const [countries, setCountries] = React.useState<ICountry[]>([]);

	React.useEffect(() => {
		getCountries()
			.then((countries) => {
				setCountries(countries);
			})
			.catch((error) => {
				console.error(error);
			});
	}, []);

	let countryImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Question_mark_%28black%29.svg/800px-Question_mark_%28black%29.svg.png';
	if (country && country.Data) {
		countryImage = `https://flagcdn.com/256x192/${country.Data.code.toLowerCase()}.png`;
	}

	return (
		<>
			<NavigationBar>
				<Link to="/board">Board</Link>
				<Link to="/settings">Settings</Link>
			</NavigationBar>
			<div className={styles.container}>
				<div className={styles['form-heading']}>
					<h1>New feedback</h1>
				</div>
				<form>
					<Step
						id="country"
						control={
							<CountryDropdown
								countries={countries}
								onChange={(c) => setCountry(c)}
							/>
						}
						imageSrc={countryImage}
					/>
					<div className={styles.step}>
						<div className={styles.control}>
							<TextField label="Country" />
						</div>
						<div className={styles.visualization}>
							<StepRoundImage
								src="https://flagcdn.com/w160/za.png"
								width={120}
								height={120}
							/>
						</div>
					</div>
				</form>
			</div>
		</>
	);
};
