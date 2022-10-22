import { useMutation } from '@apollo/client';
import {
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { AiOutlineUpload } from 'react-icons/ai';
import { BiDollar } from 'react-icons/bi';
import { SatoshiIconTilted } from '../../../../components/icons';
import { FileUpload } from '../../../../components/molecules';
import {
  ButtonComponent,
  ImageWithReload,
  TextArea,
  TextBox,
} from '../../../../components/ui';

import {
  MUTATION_CREATE_PROJECT_REWARD,
  MUTATION_UPDATE_PROJECT_REWARD,
} from '../../../../graphql/mutations';
import { useNotification } from '../../../../utils';
import { ProjectReward } from '../../../../types/generated/graphql';

interface IAddRewards {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (_: ProjectReward) => void;
  rewards?: ProjectReward;
  isSatoshi: boolean;
  setIsSatoshi: React.Dispatch<React.SetStateAction<boolean>>;
  projectId?: number;
}

export const defaultReward: ProjectReward = {
  id: 0,
  name: '',
  description: '',
  cost: 0,
  image: '',
  deleted: false,
  stock: 0,
  backers: 0,
  sold: 0,
};

export const AddRewards = ({
  isOpen,
  onClose,
  rewards: availableReward,
  onSubmit,
  projectId,
  isSatoshi,
}: IAddRewards) => {
  const { toast } = useNotification();
  const [_rewards, _setRewards] = useState<ProjectReward>(
    availableReward || defaultReward,
  );
  const rewards = useRef(_rewards);
  const setRewards = (value: ProjectReward) => {
    rewards.current = value;
    _setRewards(value);
  };

  const [formError, setFormError] = useState<any>({});

  const [createReward, { loading: createRewardLoading }] = useMutation(
    MUTATION_CREATE_PROJECT_REWARD,
    {
      onCompleted(data) {
        toast({
          title: 'Successfully created!',
          description: `Reward ${data.createProjectReward.name} was successfully created`,
          status: 'success',
        });
        onSubmit(data.createProjectReward);
        onClose();
      },
      onError(error) {
        toast({
          title: 'Failed to create reward',
          description: `${error}`,
          status: 'error',
        });
      },
    },
  );

  const [updateReward, { loading: updateRewardLoading }] = useMutation(
    MUTATION_UPDATE_PROJECT_REWARD,
    {
      onCompleted(data) {
        toast({
          title: 'Successfully updated!',
          description: `Reward ${data.updateProjectReward.name} was successfully updated`,
          status: 'success',
        });
        onSubmit(data.updateProjectReward);
        onClose();
      },
      onError(error) {
        toast({
          title: 'Failed to update reward',
          description: `${error}`,
          status: 'error',
        });
      },
    },
  );

  useEffect(() => {
    if (availableReward && availableReward !== rewards.current) {
      setRewards(availableReward);
    }
  }, [availableReward]);

  const handleTextChange = (event: any) => {
    setFormError({});
    if (event) {
      const { name, value } = event.target;
      if (name) {
        setRewards({ ...rewards.current, [name]: value });
      }
    }
  };

  const handleConfirmReward = () => {
    const isValid = validateReward();
    if (!isValid) {
      return;
    }

    if ((rewards.current as ProjectReward).id) {
      const updateRewardsInput = {
        projectRewardId: (rewards.current as ProjectReward).id,
        name: rewards.current.name,
        description: rewards.current.description,
        cost: rewards.current.cost * 100, // multiplied by 100 to express the cost in cents
        image: rewards.current.image,
      };
      updateReward({ variables: { input: updateRewardsInput } });
    } else {
      const createRewardsInput = {
        cost: rewards.current.cost * 100, // multiplied by 100 to express the cost in cents
        description: rewards.current.description,
        image: rewards.current.image,
        name: rewards.current.name,
        stock: rewards.current.stock,
        projectId,
      };
      createReward({ variables: { input: createRewardsInput } });
    }
  };

  const handleUpload = (url: string) => {
    setRewards({ ...rewards.current, image: url });
  };

  const validateReward = () => {
    const errors: any = {};
    let isValid = true;
    if (!rewards.current.name) {
      errors.name = 'Name is a required field';
      isValid = false;
    }

    if (!rewards.current.cost || !(rewards.current.cost > 0)) {
      errors.cost = 'Cost needs to be greater than 1';
      isValid = false;
    }

    if (
      rewards.current.description &&
      rewards.current.description.length > 280
    ) {
      errors.cost = 'description must be less than 280 characters';
      isValid = false;
    }

    if (!isValid) {
      setFormError(errors);
    }

    return isValid;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" isCentered>
      <ModalOverlay />
      <ModalContent display="flex" alignItems="flex-start" padding="20px 0px">
        <ModalHeader paddinX="20px">
          <Text fontSize="18px" fontWeight={600}>
            Add a Reward
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody width="100%">
          <VStack
            width="100%"
            paddingBottom="20px"
            marginBottom="20px"
            maxHeight="600px"
            overflowY="auto"
            alignItems="flex-start"
            spacing="10px"
            paddingX="2px"
          >
            <VStack width="100%" alignItems="flex-start">
              <Text>Name</Text>
              <TextBox
                placeholder={'T - Shirt ...'}
                value={rewards.current.name}
                name="name"
                onChange={handleTextChange}
                error={formError.name}
              />
            </VStack>

            <VStack width="100%" alignItems="flex-start">
              <Text>Description</Text>
              <TextArea
                placeholder={' ...'}
                value={rewards.current.description!}
                name="description"
                onChange={handleTextChange}
              />
            </VStack>

            <VStack width="100%" alignItems="flex-start">
              <FileUpload onUploadComplete={handleUpload}>
                {rewards.current.image ? (
                  <HStack justifyContent="center">
                    <ImageWithReload
                      borderRadius="4px"
                      src={rewards.current.image}
                      maxHeight="200px"
                    />
                  </HStack>
                ) : (
                  <HStack
                    borderRadius="4px"
                    backgroundColor="brand.bgGrey"
                    width="100%"
                    height="70px"
                    justifyContent="center"
                    alignItems="center"
                    _hover={{ backgroundColor: 'brand.gray300' }}
                  >
                    <AiOutlineUpload />
                    <Text>Add image</Text>
                  </HStack>
                )}
              </FileUpload>
            </VStack>
            <VStack width="100%" alignItems="flex-start">
              <Text>Cost of reward</Text>
              <InputGroup>
                <InputLeftAddon>
                  {isSatoshi ? <SatoshiIconTilted /> : <BiDollar />}
                </InputLeftAddon>
                <Input
                  focusBorderColor="brand.primary"
                  name="cost"
                  type="number"
                  onChange={handleTextChange}
                  value={rewards.current.cost / 100} // convert from cents to dollars
                  isInvalid={formError.cost}
                />
              </InputGroup>
              {formError.cost && (
                <Text fontSize="12px" color="red.500">
                  {formError.cost}
                </Text>
              )}
            </VStack>
          </VStack>
          <VStack spacing="10px">
            <ButtonComponent
              isLoading={createRewardLoading || updateRewardLoading}
              isFullWidth
              primary
              onClick={handleConfirmReward}
            >
              Confirm
            </ButtonComponent>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};